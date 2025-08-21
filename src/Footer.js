import React from "react";
import "./style.css";

const githubUrl = "https://github.com/ogu59/weathering-image";

function Footer(props) {
  return (
    <footer>
      <hr />
      <p>GitHub: <a href={githubUrl}>{githubUrl}</a></p>
    </footer>
  );
}

export default Footer;
