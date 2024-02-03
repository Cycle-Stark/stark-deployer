import { MantineColorsTuple, createTheme } from "@mantine/core";

const darkBlue: MantineColorsTuple = [
  '#ecf7fd',
  '#daecf6',
  '#afd9f0',
  '#81c4ea',
  '#60b3e4',
  '#4da9e2',
  '#42a3e2',
  '#358ec9',
  '#297eb4',
  '#0e6d9f'
];


export const theme = createTheme({
  colors: {
    darkBlue
  },
  primaryColor: 'darkBlue',
  fontFamily: "Space Grotesk, sans-serif"
});
