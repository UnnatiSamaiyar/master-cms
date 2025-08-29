import { RenderLeafProps } from "slate-react";

const RenderLeafs = (props: RenderLeafProps) => {
  let { leaf, children, attributes } = props;
  const { text, ...rest } = leaf;

  if ("bold" in leaf && leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if ("italic" in leaf && leaf.italic) {
    children = <i>{children}</i>;
  }
  if ("underline" in leaf && leaf.underline) {
    children = <u>{children}</u>;
  }

  if ("superscript" in leaf && leaf.superscript) {
    children = <sup>{children}</sup>;
  }
  if ("subscript" in leaf && leaf.subscript) {
    children = <sub>{children}</sub>;
  }
  if ("code" in leaf && leaf.code) {
    children = (
      <code className="bg-muted font-bold py-1 px-1 rounded-md mx-1">
        {children}
      </code>
    );
  }

  if ("highlight" in leaf && leaf.highlight) {
    children = (
      <span style={{ backgroundColor: leaf.highlight as any }}>{children}</span>
    );
  }
  if ("fontSize" in leaf && leaf.fontSize) {
    children = (
      <span style={{ fontSize: leaf.fontSize as any }}>{children}</span>
    );
  }
  if ("color" in leaf && leaf.color) {
    children = <span style={{ color: leaf.color as any }}>{children}</span>;
  }

  if ("fontFamily" in leaf && leaf.fontFamily) {
    children = (
      <span style={{ fontFamily: leaf.fontFamily as any }}>{children}</span>
    );
  }

  if ("fontWieght" in leaf && leaf.fontWieght) {
    children = (
      <span style={{ fontWeight: leaf.fontWieght as any }}>{children}</span>
    );
  }
  if ("strike" in leaf && leaf.strike) {
    children = <s>{children}</s>;
  }
  return (
    <span {...attributes} className={Object.keys(rest).join(" ")}>
      {children}
    </span>
  );
};

export default RenderLeafs;
