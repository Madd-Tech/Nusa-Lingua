import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "@/lib/markdown-toc";
import { cn } from "@/lib/utils";

function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : isValidElement(c) ? textOf((c.props as { children?: ReactNode }).children) : ""))
    .join("");
}

/**
 * Render markdown. HTML mentah tidak dirender (aman dari XSS).
 * `variant="chat"` = gaya ringkas untuk bubble obrolan.
 */
export function MarkdownContent({
  content,
  className,
  variant = "article",
}: {
  content: string;
  className?: string;
  variant?: "article" | "chat";
}) {
  const article = variant === "article";
  return (
    <div
      className={cn(
        "prose prose-stone max-w-none dark:prose-invert",
        article
          ? "prose-headings:scroll-mt-24 prose-headings:font-extrabold prose-headings:tracking-tight prose-a:font-bold prose-a:text-budaya-deep prose-img:rounded-2xl prose-blockquote:border-l-budaya prose-blockquote:font-semibold prose-blockquote:not-italic dark:prose-a:text-budaya"
          : "prose-sm prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-pre:my-2 text-inherit [&_*]:text-inherit",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children, node: _node, ...props }) => (
            <h2 id={article ? slugify(textOf(children)) : undefined} {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, node: _node, ...props }) => (
            <h3 id={article ? slugify(textOf(children)) : undefined} {...props}>
              {children}
            </h3>
          ),
          a: ({ href, children, node: _node, ...props }) => {
            const external = !!href && /^https?:\/\//.test(href);
            return (
              <a href={href} {...props} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {children}
                {external ? <span className="sr-only"> (membuka tab baru)</span> : null}
              </a>
            );
          },
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          img: ({ alt, node: _node, ...props }) => <img alt={alt ?? ""} loading="lazy" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
