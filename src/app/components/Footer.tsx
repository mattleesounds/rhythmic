import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="text-right">
      Created by{" "}
      <Link href="https://www.mattlee.world/" className="text-blue-700">
        Matt Lee
      </Link>
    </div>
  );
};

export default Footer;
