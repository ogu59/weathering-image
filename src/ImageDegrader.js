function getImageFromData(data) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = data;
  });
}

export async function fitImageSize(imageData, size) {
  if (!imageData) return "";

  const image = await getImageFromData(imageData);
  const canvas = document.createElement("canvas");

  const imageSize = image.width * image.height;
  const scale = (size < imageSize) ? Math.sqrt(size / imageSize) : 1;
  canvas.width = parseInt(image.width * scale);
  canvas.height = parseInt(image.height * scale);

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 1);
}

function processFirstPass(image, quality, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", quality);
}

function processSecondPass(image, overlayAmount, colorBurnAmount, quality, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = "black";
  ctx.globalAlpha = overlayAmount;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "color-burn";
  ctx.fillStyle = "rgb(230, 225, 170)";
  ctx.globalAlpha = colorBurnAmount;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", quality);
}

export async function getDegradedImage(imageData, degrade) {
  if (!imageData) return "";

  const image = await getImageFromData(imageData);
  const resultWidth = image.width;
  const resultHeight = image.height;

  const firstPassScale = (1 - degrade / 100) * 0.5 + 0.5;
  let result = processFirstPass(
    image,
    (100 - degrade) / 100,
    resultWidth * firstPassScale, resultHeight * firstPassScale);

  result = processSecondPass(
    await getImageFromData(result),
    degrade / 100 * 0.1,
    degrade / 100,
    (100 - degrade) / 100,
    resultWidth, resultHeight);

  return result;
}

/* -------------------------------
   ⬇️ 여기 추가하면 됨 (시대 매핑 함수)
--------------------------------- */

export const ERA_STEPS = [
  { d: 0,   years: "2021–2025", label: "최신 디지털" },
  { d: 5,   years: "2015–2020", label: "근래 스마트폰" },
  { d: 10,  years: "2010–2014", label: "초중기 스마트폰" },
  { d: 15,  years: "2006–2009", label: "초기 스마트폰/컴팩트" },
  { d: 20,  years: "2003–2006", label: "컴팩트 디카" },
  { d: 25,  years: "1999–2002", label: "초창기 디카" },
  { d: 30,  years: "1995–1998", label: "필름 스캔(미니랩)" },
  { d: 35,  years: "1990–1994", label: "35mm 프린트 스캔" },
  { d: 40,  years: "1985–1989", label: "80s 후반 바램" },
  { d: 45,  years: "1980–1984", label: "80s 초반 바램" },
  { d: 50,  years: "1975–1979", label: "레트로 컬러" },
  { d: 55,  years: "1970–1974", label: "빈티지 스냅" },
  { d: 60,  years: "1965–1969", label: "구형 컬러 바램" },
  { d: 65,  years: "1960–1964", label: "컬러 초창기 톤" },
  { d: 70,  years: "1955–1959", label: "강한 세피아 기운" },
  { d: 75,  years: "1950–1954", label: "세피아+대비 손실" },
  { d: 80,  years: "1940s",      label: "오래된 컬러/착색" },
  { d: 85,  years: "1930s",      label: "손색 느낌" },
  { d: 90,  years: "1920s",      label: "예스러운 톤" },
  { d: 95,  years: "1910s",      label: "강한 열화" },
  { d: 100, years: "1890s–1900s",label: "아주 오래된 인화" },
];

export function guessEraByDegrade(degrade) {
  const d = Math.max(0, Math.min(100, Math.round(degrade / 5) * 5));
  const found = ERA_STEPS.find(e => e.d === d);
  return found || ERA_STEPS[0];
}

