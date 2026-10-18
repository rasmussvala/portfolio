const BREAKPOINT = 900;
const isSmall = () => window.innerWidth < BREAKPOINT;

export default function sketch(p) {
  let letters = [];
  let asterisks = [];
  let customFont;
  let textSize = 120;
  let canvasHeight = 430;

  function getCSSVariable(variableName) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
  }

  const primaryColor = getCSSVariable("--header-color");
  const textColor = getCSSVariable("--text-color");
  const backgroundColor = getCSSVariable("--background-color");

  p.preload = () => {
    customFont = p.loadFont(`${process.env.PUBLIC_URL}/Anton-Regular.ttf`);
  };

  p.setup = () => {
    p.createCanvas(window.innerWidth, canvasHeight);
    adjustTextSize();
    p.textFont(customFont);
    createLettersAndAsterisks("Rasmus Svala");
  };

  p.draw = () => {
    p.background(backgroundColor);

    for (let letter of letters) {
      letter.update();
      letter.display();
    }

    for (let asterisk of asterisks) {
      asterisk.update();
      asterisk.display();
    }
  };

  p.windowResized = () => {
    if (p && p.canvas && typeof p.textSize === "function") {
      p.resizeCanvas(window.innerWidth, canvasHeight);
      adjustTextSize();
      createLettersAndAsterisks("Rasmus Svala");
    }
  };

  function adjustTextSize() {
    if (p && typeof p.textSize === "function") {
      textSize = isSmall() ? 60 : 120;
      p.textSize(textSize);
    }
  }

  function createLettersAndAsterisks(message) {
    letters = [];
    asterisks = [];

    let totalWidth = 0;
    for (let i = 0; i < message.length; i++) {
      totalWidth += p.textWidth(message.charAt(i));
    }

    let startX;
    let offsetX1;
    let offsetX2;
    let offsetY;
    if (isSmall()) {
      startX = 16;
      offsetX1 = 40;
      offsetX2 = 15;
      offsetY = 40;
    } else {
      startX = (p.width - totalWidth) / 2;
      offsetX1 = 30;
      offsetX2 = 30;
      offsetY = 0;
    }

    let endX = startX + totalWidth;
    let x = startX;

    for (let i = 0; i < message.length; i++) {
      let letter = message.charAt(i);
      let w = p.textWidth(letter);

      letters.push(new MovableLetter(letter, x, p.height / 2));

      x += w;
    }

    asterisks.push(new SpinningAsterisk(startX - offsetX1, 210));
    asterisks.push(new SpinningAsterisk(endX + offsetX2, 100 + offsetY));
  }

  function updatePositionWithMouseRepulsion(position, originalPosition) {
    const dx = position.x - p.mouseX;
    const dy = position.y - p.mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 100) {
      const force = p.map(distance, 0, 100, 10, 0);
      const scale = distance > 0 ? force / distance : 0;
      position.x += dx * scale;
      position.y += dy * scale;
    } else {
      position.x = p.lerp(position.x, originalPosition.x, 0.1);
      position.y = p.lerp(position.y, originalPosition.y, 0.1);
    }
  }

  class SpinningAsterisk {
    constructor(x, y) {
      this.position = p.createVector(x, y);
      this.originalPosition = p.createVector(x, y);
      this.angle = 0;
    }

    update() {
      this.angle += 0.02;
      updatePositionWithMouseRepulsion(this.position, this.originalPosition);
    }

    display() {
      p.push();
      p.translate(this.position.x, this.position.y);
      p.rotate(this.angle);
      p.fill(textColor);
      p.textSize(50);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("*", 0, 0);
      p.pop();
    }
  }

  class MovableLetter {
    constructor(letter, x, y) {
      this.letter = letter;
      this.position = p.createVector(x, y);
      this.originalPosition = p.createVector(x, y);
    }

    update() {
      updatePositionWithMouseRepulsion(this.position, this.originalPosition);
    }

    display() {
      p.fill(primaryColor);
      p.text(this.letter, this.position.x, this.position.y);
    }
  }
}
