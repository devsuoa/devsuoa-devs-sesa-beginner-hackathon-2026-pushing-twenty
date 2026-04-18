import type { LevelConfig } from "./levelTypes";

export const squareLengthLevel: LevelConfig = {
  id: "square-length",
  title: "Square the length",
  description:
    "Your code is already inside a function. Write code that returns the square of the length of nums.",

  pythonCode: `
nums = [1,2,3]
sum = 0
for i in nums:
    sum += i
print(sum)
return sum
`.trim(),

  functionName: "solve",
  params: ["nums"],

  visibleTests: [
    {
      inputs: [[1, 2, 3]],
      expected: 9,
      visible: true,
    },
  ],

  hiddenTests: [
    {
      inputs: [[]],
      expected: 0,
      visible: false,
    },
    {
      inputs: [[7]],
      expected: 1,
      visible: false,
    },
    {
      inputs: [[1, 2, 3, 4]],
      expected: 16,
      visible: false,
    },
    {
      inputs: [[9, 8, 7, 6, 5]],
      expected: 25,
      visible: false,
    },
  ],
};