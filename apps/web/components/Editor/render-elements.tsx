import {
  BlockQuote,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ListItem,
  Paragraph,
} from "@/components/ui/typography";
import { RenderElementProps, useSelected, useSlate } from "slate-react";
import { Node, Range } from "slate";
import HorizontalRuleBlock from "./Blocks/horizontal";
import LinkBlock from "./Blocks/link";
import NumberList from "./Blocks/number-list";
import BulletedList from "./Blocks/bulleted-list";
import ImageBlock from "./Blocks/image";

const RenderElement = ({
  children,
  attributes,
  element,
}: RenderElementProps) => {
  const style: React.CSSProperties = { textAlign: (element as any).align };
  const selected = useSelected();
  const editor = useSlate();
  const { selection } = editor;
  const isCollapased = selection && Range.isCollapsed(selection);
  const isEmpty =
    Node.string(element).trim() === "" && element.children.length === 1;
  switch (element.type) {
    case "p":
      return (
        <Paragraph
          {...attributes}
          {...element}
          style={style}
          className={`${
            selected && isCollapased && isEmpty ? "selected-empty-element" : ""
          }`}
        >
          {children}
        </Paragraph>
      );
    case "img":
      return (
        <ImageBlock
          attributes={attributes}
          element={element}
          children={children}
        />
      );
    case "h1":
      return (
        <Heading1 {...attributes} style={style}>
          {children}
        </Heading1>
      );
    case "h2":
      return (
        <Heading2 {...attributes} style={style}>
          {children}
        </Heading2>
      );
    case "h3":
      return (
        <Heading3 {...attributes} style={style}>
          {children}
        </Heading3>
      );
    case "h4":
      return (
        <Heading4 {...attributes} style={style}>
          {children}
        </Heading4>
      );
    case "h5":
      return (
        <Heading5 {...attributes} style={style}>
          {children}
        </Heading5>
      );
    case "h6":
      return (
        <Heading6 {...attributes} style={style}>
          {children}
        </Heading6>
      );
    case "quote-block":
      return (
        <BlockQuote {...attributes} {...element} style={style}>
          {children}
        </BlockQuote>
      );
    case "ul":
      return (
        <BulletedList {...attributes} {...element} style={style}>
          {children}
        </BulletedList>
      );
    case "li":
      return (
        <ListItem {...attributes} {...element} style={style}>
          {children}
        </ListItem>
      );
    case "ol":
      return (
        <NumberList {...attributes} {...element} style={style}>
          {children}
        </NumberList>
      );
    case "link":
      return (
        <LinkBlock
          element={element}
          attributes={attributes}
          children={children}
        />
      );
    case "hr":
      return (
        <HorizontalRuleBlock
          attributes={attributes}
          children={children}
          element={element}
        />
      );
    default:
      return <Paragraph {...attributes}>{children}</Paragraph>;
  }
};

export default RenderElement;
