import { useRef, useState } from "react";
import { insert, setIfMissing, useClient, type ArrayOfObjectsInputProps } from "sanity";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { UploadIcon } from "@sanity/icons/Upload";
import { apiVersion } from "../env";

const batchSize = 5;

type Progress = { done: number; total: number; failed: number; reasons: string[] };

function uniqueKey() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function isVideo(file: File) {
  return file.type.startsWith("video/") || /\.(mov|mp4|m4v|webm)$/i.test(file.name);
}

function isWebVideo(file: File) {
  return ["video/mp4", "video/webm"].includes(file.type) || /\.(mp4|m4v|webm)$/i.test(file.name);
}

function measureVideo(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.muted = true;
    probe.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (probe.videoWidth && probe.videoHeight) resolve({ width: probe.videoWidth, height: probe.videoHeight });
      else reject(new Error(`${file.name} can't be played in browsers. Export it as an H.264 MP4.`));
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name} can't be played in browsers. Export it as an H.264 MP4.`));
    };
    probe.src = url;
  });
}

function referenceTo(assetId: string) {
  return { _type: "reference", _ref: assetId };
}

export function MediaUploadInput(props: ArrayOfObjectsInputProps) {
  const { onChange, renderDefault, readOnly, schemaType } = props;
  const allowsVideo = schemaType.of.some((member) => member.name === "video");
  const client = useClient({ apiVersion });
  const picker = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  const uploadOne = async (file: File) => {
    if (isVideo(file)) {
      if (!allowsVideo) throw new Error(`${file.name} is a video; this field only takes images.`);
      if (!isWebVideo(file)) throw new Error(`${file.name} is a .mov file. Export it as an MP4 (H.264) and upload that.`);
      const size = await measureVideo(file);
      const asset = await client.assets.upload("file", file, { filename: file.name });
      return {
        _type: "video",
        _key: uniqueKey(),
        file: { _type: "file", asset: referenceTo(asset._id) },
        ...size,
      };
    }
    const asset = await client.assets.upload("image", file, { filename: file.name });
    return { _type: "image", _key: uniqueKey(), asset: referenceTo(asset._id) };
  };

  const upload = async (files: File[]) => {
    if (!files.length) return;
    const state: Progress = { done: 0, total: files.length, failed: 0, reasons: [] };
    setProgress({ ...state });
    onChange(setIfMissing([]));

    for (let start = 0; start < files.length; start += batchSize) {
      const batch = files.slice(start, start + batchSize);
      const results = await Promise.allSettled(batch.map(uploadOne));
      const items = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
      if (items.length) onChange(insert(items, "after", [-1]));
      state.done += batch.length;
      state.failed += batch.length - items.length;
      for (const result of results) {
        if (result.status === "rejected") state.reasons.push(String(result.reason?.message ?? result.reason));
      }
      setProgress({ ...state, reasons: [...state.reasons] });
    }
  };

  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    upload(files).finally(() => setProgress((current) => (current && current.failed ? current : null)));
  };

  const uploading = progress !== null && progress.done < progress.total;

  return (
    <Stack gap={3}>
      {renderDefault(props)}
      <input
        ref={picker}
        type="file"
        accept={allowsVideo ? "image/*,video/mp4,video/webm" : "image/*"}
        multiple
        hidden
        onChange={onPick}
      />
      <Flex gap={3} align="center">
        <Button
          icon={UploadIcon}
          mode="ghost"
          text={uploading ? `Uploading ${progress.done} / ${progress.total}…` : allowsVideo ? "Upload images & videos" : "Upload images"}
          disabled={readOnly || uploading}
          onClick={() => picker.current?.click()}
        />
        {progress && !uploading && progress.failed > 0 && (
          <Card tone="critical" padding={3} radius={2}>
            <Stack gap={2}>
              <Text size={1} weight="semibold">
                {progress.failed} of {progress.total} files weren't added.
              </Text>
              {progress.reasons.map((reason) => (
                <Text key={reason} size={1}>
                  {reason}
                </Text>
              ))}
            </Stack>
          </Card>
        )}
      </Flex>
    </Stack>
  );
}
