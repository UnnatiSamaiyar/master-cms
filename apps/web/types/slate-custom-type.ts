import {
  BaseEditor,
  Element,
  BaseRange,
  Range,
  BaseElement,
  Editor,
} from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

export interface List {
  id: string;
  icon: React.ReactNode;
  type: "ul" | "ol";
}

export interface Alignment {
  id: string;
  icon: React.ReactNode;
  type: AlignType;
}

export interface Marks {
  id: string;
  icon: React.ReactNode;
  mark: string;
  shortcut?: string;
}
export type EmptyText = { text: string };

export type RichText = EmptyText & {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  kbd?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  highlight?: React.CSSProperties["backgroundColor"];
  fontFamily?: React.CSSProperties["fontFamily"];
  color?: React.CSSProperties["color"];
  fontSize?: React.CSSProperties["fontSize"];
  fontWeight?: React.CSSProperties["fontWeight"];
};

export type AlignType = "right" | "justify" | "left" | "center";

export interface MyBlockElement extends BaseElement {
  id: string;
  align?: React.CSSProperties["textAlign"];
}

export interface MyParagraphElement extends MyBlockElement {
  type: "p";
}

export interface MyH1Element extends MyBlockElement {
  type: "h1";
}
export interface MyH2Element extends MyBlockElement {
  type: "h2";
}

export interface MyH3Element extends MyBlockElement {
  type: "h3";
}

export interface MyH4Element extends MyBlockElement {
  type: "h4";
}

export interface MyH5Element extends MyBlockElement {
  type: "h5";
}

export interface MyH6Element extends MyBlockElement {
  type: "h6";
}

export interface MyQuoteBlockElement extends MyBlockElement {
  type: "quote-block";
}

export interface MyLinkElement {
  type: "link";
  href: string;
  children: RichText[];
}

export interface MyListItemElement extends MyBlockElement {
  type: "li";
}

export interface MyBulletedListElement extends MyBlockElement {
  type: "ul";
  children: MyListItemElement[];
}

export interface MyNumberListElement extends MyBlockElement {
  type: "ol";
  children: MyListItemElement[];
}

export interface MyBrElement {
  id: string;
  type: "hr";
  children: [EmptyText];
}

export interface MyImageELement {
  id: string;
  type: "img";
  url: string;
  caption?: string;
  targetUrl?: string;
  children: [EmptyText];
}

export type MyCustomElement =
  | MyParagraphElement
  | MyH1Element
  | MyH2Element
  | MyH3Element
  | MyH4Element
  | MyH5Element
  | MyH6Element
  | MyImageELement
  | MyLinkElement
  | MyListItemElement
  | MyNumberListElement
  | MyBulletedListElement
  | MyQuoteBlockElement
  | MyBrElement
  | MyImageELement;

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    nodeToDecorations?: Map<Element, Range[]>;
  };

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: MyCustomElement;
    Text: RichText | EmptyText;
    Range: BaseRange & {
      [key: string]: unknown;
    };
  }
}

export type SlatePlugin = (editor: Editor) => Editor;
