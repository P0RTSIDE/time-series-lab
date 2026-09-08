import katex from "katex";
import "katex/dist/katex.min.css";

export function M({
  expr,
  block = false,
}: {
  expr: string;
  block?: boolean;
}) {
  const html = katex.renderToString(expr, {
    throwOnError: false,
    displayMode: block,
  });
  return block ? (
    <div className="math-block" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
