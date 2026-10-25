const Footer: React.FC = () => {
  return (
    <div className="font-[HN] w-full border-dashed border-t border-black text-2xs text-left uppercase px-2 py-10">
      <p>
        a personal database / made with {`<3`} by{" "}
        <a
          href="https://elia-orsini.com"
          rel="noreferrer"
          target="_blank"
          className="underline"
        >
          elia
        </a>{" "}
        / © {new Date().getFullYear()} / frontend crafted using next.js
      </p>
    </div>
  );
};

export default Footer;
