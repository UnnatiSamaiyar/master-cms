import React from "react";
import { cn } from "@/lib/utils";

interface ListProps extends React.HTMLAttributes<HTMLLIElement> {}
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface BlockquoteProps extends React.HtmlHTMLAttributes<HTMLQuoteElement> {}

const BlockQuote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, ...props }, ref) => {
    return (
      <blockquote
        ref={ref}
        className={cn("border-l-2 pl-6 mt-4 italic", className)}
        {...props}
      />
    );
  },
);

const ListItem = React.forwardRef<HTMLLIElement, ListProps>(
  ({ className, ...props }, ref) => {
    return <li className={cn("", className)} ref={ref} {...props} />;
  },
);

const Paragraph = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("leading-7 mt-4", className)} {...props} />
));

Paragraph.displayName = "Paragraph";

const Heading1 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn(
          "scroll-m-20 text-5xl font-extrabold tracking-tight lg:text-5xl mt-6",
          className,
        )}
        {...props}
      />
    );
  },
);
const Heading2 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(
          "scroll-m-20 text-4xl font-semibold tracking-tight mt-5",
          className,
        )}
        {...props}
      />
    );
  },
);
const Heading3 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "scroll-m-20 text-3xl font-semibold tracking-tight mt-4",
          className,
        )}
        {...props}
      />
    );
  },
);
const Heading4 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => {
    return (
      <h4
        ref={ref}
        className={cn(
          "scroll-m-20 text-2xl font-semibold tracking-tight mt-3",
          className,
        )}
        {...props}
      />
    );
  },
);
const Heading5 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn("scroll-m-20 tracking-tight text-xl mt-2", className)}
        {...props}
      />
    );
  },
);
const Heading6 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => {
    return (
      <h6
        ref={ref}
        className={cn("scroll-m-20 tracking-tight text-base mt-1", className)}
        {...props}
      />
    );
  },
);

export {
  ListItem,
  BlockQuote,
  Paragraph,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
};
