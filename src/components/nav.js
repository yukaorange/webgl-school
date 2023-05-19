import { useState } from "react";

export default function Nav() {
  const [navIsOpen, setNavIsOpen] = useState(false);
  const toggleNav = () => {
    setNavIsOpen((prev) => {
      return !prev;
    });
  };
  const closeNav = () => {
    setNavIsOpen(false);
  };
  return (
    <nav>
    </nav>
  );
}
