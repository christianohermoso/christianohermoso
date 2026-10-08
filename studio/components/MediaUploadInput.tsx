import { useRef, useState } from "react";
import { insert, setIfMissing, useClient, type ArrayOfObjectsInputProps } from "sanity";
import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { UploadIcon } from "@sanity/icons/Upload";
import { apiVersion } from "../env";

const batchSize = 5;

type Progress = { done: number; total: number; failed: number };

function uniqueKey() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function isVideo(file: File) {
  return file.type.startsWith("video/") || /\.(mov|mp4|m4v|webm)$/i.test(file.name);
}

function referenceTo(assetId: string) {
  return { _type: "reference", _ref: assetId };
}

export function MediaUploadInput(props: ArrayOfObjectsInputProps) {
  const { onChange, renderDefault, readOnly } = props;
  const client = useClient({ apiVersion });
  const picker = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  const uploadOne = async (file: File) => {
    if (isVideo(file)) {
      const asset = await client.assets.upload("file", file, { filename: file.name });
      return { _type: "video", _key: uniqueKey(), file: { _type: "file", asset: referenceTo(asset._id) } };
    }
    const asset = await client.assets.upload("image", file, { filename: file.name });
    return { _type: "image", _key: uniqueKey(), asset: referenceTo(asset._id) };
  };

  const upload = async (files: File[]) => {
    if (!files.length) return;
    const state: Progress = { done: 0, total: files.length, failed: 0 };
    setProgress({ ...state });
    onChange(setIfMissing([]));

    for (let start = 0; start < files.length; start += batchSize) {
      const batch = files.slice(start, start + batchSize);
      const results = await Promise.allSettled(batch.map(uploadOne));
      const items = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
      if (items.length) onChange(insert(items, "after", [-1]));
      state.done += batch.length;
      state.failed += batch.length - items.length;
      setProgress({ ...state });
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
        accept="image/*,video/*"
        multiple
        hidden
        onChange={onPick}
      />
      <Flex gap={3} align="center">
        <Button
          icon={UploadIcon}
          mode="ghost"
          text={uploading ? `Uploading ${progress.done} / ${progress.total}…` : "Upload images & videos"}
          disabled={readOnly || uploading}
          onClick={() => picker.current?.click()}
        />
        {progress && !uploading && progress.failed > 0 && (
          <Card tone="critical" padding={2} radius={2}>
            <Text size={1}>
              {progress.failed} of {progress.total} files failed to upload. Try those again.
            </Text>
          </Card>
        )}
      </Flex>
    </Stack>
  );
}
