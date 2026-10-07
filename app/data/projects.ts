import { advertising, overview, type Photo } from "./photos";

export type Project = {
  number: number;
  title: string;
  photos: Photo[];
};

function project(number: number, source: Photo[], indexes: number[]): Project {
  return {
    number,
    title: `Project ${String(number).padStart(2, "0")}`,
    photos: indexes.map((index) => source[index]),
  };
}

export const overviewProjects: Project[] = [
  project(1, overview, [0]),
  project(2, overview, [1, 24, 25, 26]),
  project(3, overview, [2]),
  project(4, overview, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 82]),
  project(5, overview, [14, 16, 17, 21, 23]),
  project(6, overview, [15, 20]),
  project(7, overview, [18]),
  project(8, overview, [19, 22]),
  project(9, overview, [27, 28, 29, 30, 31, 32, 33]),
  project(10, overview, [34]),
  project(11, overview, [35]),
  project(12, overview, [36, 37]),
  project(13, overview, [38, 39, 40, 41, 42, 43]),
  project(14, overview, [44, 45]),
  project(15, overview, [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61]),
  project(16, overview, [62]),
  project(17, overview, [63]),
  project(18, overview, [64, 65]),
  project(19, overview, [66]),
  project(20, overview, [67, 68]),
  project(21, overview, [69]),
  project(22, overview, [70]),
  project(23, overview, [71, 72]),
  project(24, overview, [73, 90]),
  project(25, overview, [74]),
  project(26, overview, [75]),
  project(27, overview, [76]),
  project(28, overview, [77, 78]),
  project(29, overview, [79, 83, 85]),
  project(30, overview, [80, 81, 84, 86, 87, 88, 89]),
];

export const advertisingProjects: Project[] = [
  project(1, advertising, [0, 1, 2]),
  project(2, advertising, [3, 4, 5, 6, 7, 8, 9]),
  project(3, advertising, [10, 11, 12, 13]),
  project(4, advertising, [14, 15, 16, 17, 18]),
  project(5, advertising, [19]),
  project(6, advertising, [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]),
  project(7, advertising, [35, 36, 37, 38]),
  project(8, advertising, [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]),
  project(9, advertising, [51, 52, 53, 54, 55, 56, 57]),
  project(10, advertising, [58, 59, 60, 61, 62, 63, 64, 65]),
  project(11, advertising, [66]),
  project(12, advertising, [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79]),
  project(13, advertising, [80, 81, 82, 83, 84]),
  project(14, advertising, [85, 86]),
  project(15, advertising, [87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100]),
  project(16, advertising, [101, 102, 103]),
  project(17, advertising, [104, 105, 106, 107, 108, 109]),
  project(18, advertising, [110, 111, 112, 113, 114]),
  project(19, advertising, [115]),
  project(20, advertising, [116, 117]),
  project(21, advertising, [118, 119, 120]),
  project(22, advertising, [121, 122, 123, 124]),
  project(23, advertising, [125, 126, 127, 128, 129]),
  project(24, advertising, [130, 131, 132]),
  project(25, advertising, [133, 134]),
  project(26, advertising, [135, 136, 137, 138, 139, 140]),
];
