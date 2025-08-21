import React from "react";
import * as degrader from "./ImageDegrader";
import "./style.css";
import { guessEraByDegrade } from "./ImageDegrader";

const maxImageSize = 1500 * 1500;

class EditorSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      degrade: 0,
      degradedImageData: null,
      imageDataCache: null,
    };

    this.loadSampleImage();
  }

  handleImageLoad(data) {
    degrader.fitImageSize(data, maxImageSize)
      .then((result) => {
        const imageDataCache = new Map();
        imageDataCache.set(0, result);

        this.setState({
          degrade: 0,
          degradedImageData: result,
          imageDataCache: imageDataCache,
        }, () => this.showDegradedImage(this.state.degrade));
      });
  }

  handleDragOver(event) {
    event.preventDefault();
  }

  handleDrop(event) {
    event.preventDefault();

    if (event.dataTransfer.items[0].kind === "file") {
      const file = event.dataTransfer.items[0].getAsFile();
      this.loadImage(file);
    }
  }

  handleQualityChange(event) {
    this.setState({
      degrade: Number(event.target.value),
    }, () => this.showDegradedImage(this.state.degrade));
  }

  showDegradedImage(degrade) {
    const cache = this.state.imageDataCache.get(degrade);
    if (cache) {
      this.setState({
        degradedImageData: cache,
      });
      return;
    }

    degrader.getDegradedImage(this.state.imageDataCache.get(0), degrade)
      .then((result) => {
        const imageDataCache = new Map(this.state.imageDataCache);
        imageDataCache.set(degrade, result);

        this.setState({
          degradedImageData: result,
          imageDataCache: imageDataCache,
        });
      });
  }

  loadSampleImage() {
    const sampleImage = new Image();
    sampleImage.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(sampleImage, 0, 0, canvas.width, canvas.height);

      this.handleImageLoad(canvas.toDataURL("Image/jpeg"), 1);
    }
    sampleImage.src = document.URL + "/sample.png";
  }

  loadImage(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => this.handleImageLoad(e.target.result);
    reader.readAsDataURL(file);
  }

  showImageSelector() {
    const selector = document.getElementById("imageSelector");
    selector.click();
  }

  render() {
    return (
      <section className="imageEditor"
        onDragOver={(event) => this.handleDragOver(event)}
        onDrop={(event) => this.handleDrop(event)}
      >
        <div className="buttonContainer">
          <input type="file" id="imageSelector" accept="image/*"
            onChange={(event) => this.loadImage(event.target.files[0])}
          />
          <input type="button" value="이미지 불러오기"
            onClick={() => this.showImageSelector()}
          />
        </div>

        <img className="image" alt="불러온 이미지"
          src={this.state.degradedImageData}
        />

        <input type="range"
          min="0" max="100" step="5"
          value={this.state.degrade}
          onChange={(event) => this.handleQualityChange(event)}
        />
            {(() => {
  const eraInfo = guessEraByDegrade(this.state.degrade);
  return (
    <p style={{ marginTop: "0.5em", color: "rgb(100,100,100)", fontSize: "0.9em" }}>
      📸 {eraInfo.years} ({eraInfo.label})
    </p>
  );
})()}
      </section>
    );
  }
}

export default EditorSection;
