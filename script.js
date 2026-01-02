const logo = document.getElementById("logo");
const trail = document.getElementById("trail");
const bubble = document.getElementById("bubble");
const cta = document.getElementById("cta");
const camera = document.getElementById("camera");

const canvas = document.getElementById("pixelCanvas");
const ctx = canvas.getContext("2d");

/* CANVAS RESIZE */
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* SVG → SCREEN COORDINATE CONVERSION */
function svgToScreen(x, y) {
  const svg = document.getElementById("graph");
  const pt = svg.createSVGPoint();
  pt.x = x;
  pt.y = y;
  return pt.matrixTransform(svg.getScreenCTM());
}

/* CAMERA ZOOM */
function zoomTo(x, y, scale = 2.6) {
  const screen = svgToScreen(x, y);
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  camera.style.transform =
    `translate(${cx - screen.x}px, ${cy - screen.y}px) scale(${scale})`;
}

function resetCamera() {
  camera.style.transform = "translate(0,0) scale(1)";
}

/* TIMELINE DATA */
let step = 0;
let path = `M 100 400`;

const points = [
  {
    x: 100, y: 400, color: "#00f6ff",
    text: "In May 2016, Google introduced Allo."
  },
  {
    x: 350, y: 150, color: "#00f6ff",
    text: "Sept 2016\nIntroduced Smart Reply and embedded Google Assistant"
  },
  {
    x: 520, y: 260, color: "#ff3b3b",
    text: "Dec 2016\nPrivacy backlash\nDefault chats weren’t end-to-end encrypted"
  },
  {
    x: 650, y: 200, color: "#00f6ff",
    text: "2017 WEB CLIENT LAUNCH\n• Phone pairing\n• Single-device limitation\n• Arrived late"
  },
  {
    x: 800, y: 330, color: "#ff3b3b",
    text: "2018\nGoogle pauses investment"
  },
  {
    x: 900, y: 400, color: "#ff3b3b",
    text: "March 2019\nGoogle Allo discontinued",
    crash: true
  }
];

/* CLICK HANDLER */
logo.addEventListener("click", () => {
  if (step >= points.length - 1) return;

  step++;
  const p = points[step];

  path += ` L ${p.x} ${p.y}`;
  trail.setAttribute("d", path);
  trail.style.stroke = p.color;

  logo.setAttribute("x", p.x - 26);
  logo.setAttribute("y", p.y - 26);
  logo.style.filter = `drop-shadow(0 0 22px ${p.color})`;

  bubble.innerText = p.text;
  bubble.style.left = `${p.x + 40}px`;
  bubble.style.top = `${p.y - 60}px`;
  bubble.classList.add("show");

  zoomTo(p.x, p.y);

  if (p.crash) {
    setTimeout(() => {
      bubble.classList.remove("show");
      pixelCrash(p.x, p.y);
    }, 600);
  }
});

/* TRUE NEON PIXEL CRASH */
function pixelCrash(svgX, svgY) {
  const img = new Image();
  img.src = logo.href.baseVal;

  const screen = svgToScreen(svgX, svgY);

  img.onload = () => {
    const size = 3;
    const temp = document.createElement("canvas");
    const tctx = temp.getContext("2d");

    temp.width = img.width;
    temp.height = img.height;
    tctx.drawImage(img, 0, 0);

    const particles = [];

    for (let y = 0; y < img.height; y += size) {
      for (let x = 0; x < img.width; x += size) {
        const d = tctx.getImageData(x, y, size, size).data;
        if (d[3] > 0) {
          particles.push({
            x: screen.x + x,
            y: screen.y + y,
            vx: (Math.random() - 0.5) * 14,
            vy: Math.random() * -12,
            alpha: 1
          });
        }
      }
    }

    logo.style.opacity = "0";
    resetCamera();

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.vy += 0.7;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;

        ctx.fillStyle = `rgba(255,80,80,${p.alpha})`;
        ctx.fillRect(p.x, p.y, size, size);
      });

      if (particles.some(p => p.alpha > 0)) {
        requestAnimationFrame(animate);
      } else {
        cta.style.display = "flex";
      }
    }

    animate();
  };
}
