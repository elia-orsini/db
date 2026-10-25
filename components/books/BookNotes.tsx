const BookNotes: React.FC<{ notes: string }> = ({ notes }) => {
  const blocks = notes.split(/\n\n+/).filter(Boolean);

  return (
    <div className="space-y-4 text-left leading-relaxed">
      {blocks.map((block, index) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={index} className="text-xl font-semibold mt-6">
              {block.slice(3)}
            </h2>
          );
        }

        if (block.startsWith("# ")) {
          return (
            <h1 key={index} className="text-2xl font-bold mt-6">
              {block.slice(2)}
            </h1>
          );
        }

        if (block.startsWith("### ")) {
          return (
            <h3 key={index} className="text-lg font-semibold mt-4">
              {block.slice(4)}
            </h3>
          );
        }

        if (block.startsWith("> ")) {
          const quote = block
            .split("\n")
            .map((line) => (line.startsWith("> ") ? line.slice(2) : line))
            .join(" ");
          return (
            <blockquote
              key={index}
              className="border-l-2 border-black pl-4 italic text-gray-800"
            >
              {quote}
            </blockquote>
          );
        }

        if (block === "---") {
          return <hr key={index} className="border-black my-4" />;
        }

        return (
          <p key={index} className="whitespace-pre-wrap">
            {block}
          </p>
        );
      })}
    </div>
  );
};

export default BookNotes;
