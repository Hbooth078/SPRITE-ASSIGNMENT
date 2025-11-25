window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  const spriteImg = document.getElementById('mandrake');

  // --- Responsive helper: map drawing to CSS pixels for crisp rendering ---
  function makeCanvasResponsive() {
    const ratio = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || 480;
    const cssHeight = canvas.clientHeight || 450;

    canvas.width = Math.max(1, Math.round(cssWidth * ratio));
    canvas.height = Math.max(1, Math.round(cssHeight * ratio));

    // Map drawing operations to CSS pixels
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    return { cssWidth, cssHeight };
  }

  // --- Mandrake class (keeps your original logic, supports layout updates) ---
  class Mandrake {
    constructor(canvasWidth, canvasHeight) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.image = spriteImg;
      this.spriteWidth = 256;
      this.spriteHeight = 256;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.scale = 2;
      this.x = this.canvasWidth / 2 - (this.width * this.scale) / 2;
      this.y = this.canvasHeight / 2 - (this.height * this.scale) / 2;
      this.minFrame = 0;
      this.maxFrame = 355;
      this.frame = 0;
      this.frameX = 3;
      this.frameY = 7;
      this.updateLayout(this.canvasWidth, this.canvasHeight);
    }

    updateLayout(cssWidth, cssHeight) {
      this.canvasWidth = cssWidth;
      this.canvasHeight = cssHeight;
      // scale sprite to a reasonable portion of the canvas
      const desiredWidth = Math.min(260, this.canvasWidth * 0.45);
      this.scale = desiredWidth / this.spriteWidth;
      this.drawW = this.spriteWidth * this.scale;
      this.drawH = this.spriteHeight * this.scale;
      this.x = (this.canvasWidth - this.drawW) / 2;
      this.y = (this.canvasHeight - this.drawH) / 2;
    }

    draw(context) {
      // clear using CSS pixel dimensions
      context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.drawW,
        this.drawH
      );
    }

    update() {
      this.frame = this.frame < this.maxFrame ? this.frame + 1 : this.minFrame;
      this.frameX = this.frame % 18;
      this.frameY = Math.floor(this.frame / 18);
    }

    setAnimation(newMinFrame, newMaxFrame) {
      this.minFrame = newMinFrame;
      this.maxFrame = newMaxFrame;
      this.frame = this.minFrame;
    }
  }

  // Initialize responsive canvas and mandrake
  const initial = makeCanvasResponsive();
  const mandrake = new Mandrake(initial.cssWidth, initial.cssHeight);

  // Animation loop
  function animate() {
    mandrake.draw(ctx);
    mandrake.update();
    requestAnimationFrame(animate);
  }

  // Wire up radio controls
  const all = document.getElementById('all');
  const grow = document.getElementById('grow');
  const wink = document.getElementById('wink');
  const floatBtn = document.getElementById('float');
  const hide = document.getElementById('hide');

  if (all) all.addEventListener('click', () => mandrake.setAnimation(0, 355));
  if (grow) grow.addEventListener('click', () => mandrake.setAnimation(0, 75));
  if (wink) wink.addEventListener('click', () => mandrake.setAnimation(76, 112));
  if (floatBtn) floatBtn.addEventListener('click', () => mandrake.setAnimation(113, 262));
  if (hide) hide.addEventListener('click', () => mandrake.setAnimation(263, 355));

  // Resize handling: ResizeObserver + window resize
  function handleResize() {
    const { cssWidth, cssHeight } = makeCanvasResponsive();
    mandrake.updateLayout(cssWidth, cssHeight);
    mandrake.draw(ctx);
  }

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(handleResize);
    ro.observe(canvas.parentElement || document.body);
  }
  window.addEventListener('resize', handleResize);

  // Start when sprite image is ready
  function startWhenReady() {
    handleResize();
    requestAnimationFrame(animate);
  }

  if (spriteImg.complete && spriteImg.naturalWidth !== 0) {
    startWhenReady();
  } else {
    spriteImg.addEventListener('load', startWhenReady);
    spriteImg.addEventListener('error', () => {
      console.warn('Mandrake sprite failed to load. Check the image URL or file path.');
      handleResize();
      requestAnimationFrame(animate);
    });
  }
});

