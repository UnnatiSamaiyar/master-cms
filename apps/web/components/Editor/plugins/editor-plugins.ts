import { withReact } from "slate-react";
import { pipe } from "../utils/pipe";
import { withHistory } from "slate-history";
import { withNodeId } from "./node-id";
import { withImage } from "./image";
import withInlines from "./inline";
import withTrailingBlock from "./trailing-block";
import withConverterBlock from "./convert-block";
import withMarkdown from "./markdown";
import withHorizontalRule from "./hozirontal";
import withLink from "./link";
import { withHTML } from "./html";
import withHeading from "./heading";
import withList from "./list";

export const EditorPlugins = pipe(
  withReact,
  withHistory,
  withNodeId,
  withHeading,
  withList,
  withImage,
  withInlines,
  withTrailingBlock,
  withConverterBlock,
  withMarkdown,
  withHorizontalRule,
  withLink,
  withHTML,
);
