import { useEffect, useRef } from "react";
import "./text-overlay.css";

function scrambleText(element, finalText) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコאבגדה123456789@#$%&*";

  let iteration = 0;

  const interval = setInterval(() => {
    element.innerText = finalText
      .split("")
      .map((letter, index) => {
        if (index < iteration) {
          return finalText[index];
        }
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");

    iteration += 0.5;

    if (iteration >= finalText.length) {
      clearInterval(interval);
      element.innerText = finalText;
    }
  }, 40);
}

const aboutBlocks = [
  {
    side: "left",
    offsetClass: "offset-1",
    title: "ABOUT ME",
    body: "I am a front-end Developer with 1.7+ years of professional experience building responsive and user-friendly websites. I specialize in frontend development using React, JavaScript, HTML, and CSS, with working knowledge of the MERN stack. My background in UI development, graphics, and video editing helps me create interfaces that are both functional and visually appealing. I enjoy combining design thinking with development to build modern web experiences.",
  },
  {
    side: "right",
    offsetClass: "offset-2",
    title: "SKILLSET",
    isSkillset: true,
    skills: [
      "React.js",
      "JavaScript (ES6+)",
      "HTML5",
      "CSS3",
      "Bootstrap",
      "MongoDB",
      "Express.js",
      "Node.js",
      "Adobe Illustrator",
      "Canva",
      "Blender (Basic)",
      "Spline 3D",
      "Premiere Pro",
      "After Effects",
      "DaVinci Resolve",
      "CapCut",
    ],
  },

  {
    side: "left",
    offsetClass: "offset-3",
    title: "EXPERIENCE",
    isExperience: true,
    roles: [
      {
        company: "Digitalzone",
        role: "Web Developer",
        duration: "Sep 2023 - Apr 2025",
        location: "Pune",
        points: [
          "Developed responsive websites using HTML, CSS, Bootstrap, and JavaScript.",
          "Built modern UI layouts with a strong focus on performance and usability.",
          "Optimized responsiveness and cross-browser compatibility.",
          "Collaborated with designers and backend developers to deliver client projects.",
        ],
      },
      {
        company: "Maverick IT Industries Pvt. Ltd.",
        role: "Web Developer Intern",
        duration: "Jun 2023 - Sep 2023",
        location: "Pune",
        points: [
          "Developed responsive frontend interfaces using HTML, CSS, and Bootstrap.",
          "Assisted in building reusable UI components for client projects.",
          "Gained hands-on experience in production web development workflows.",
        ],
      },
    ],
  },
  {
    side: "right",
    offsetClass: "offset-4",
    title: "PROJECTS",
    isProjects: true,
    projects: [
      {
        name: "RAHRI - Customer Service Management System (CSM)",
        summary: "Modern CSM web application.",
        tech: "React | Next.js | JavaScript | TypeScript | Tailwind CSS | GitHub",
        live: "https://rahri.vercel.app/",
      },
      {
        name: "Purple Onion Restaurant",
        summary:
          "Responsive restaurant website with modern UI and optimized performance.",
        tech: "HTML, CSS, Bootstrap, JavaScript",
        live: "https://purpleonionrestaurant.com/",
      },
      {
        name: "Arrow Plumbing",
        summary:
          "Professional business website with responsive layout and clean user experience.",
        tech: "HTML, CSS, Bootstrap, JavaScript",
        live: "https://www.arrowplumbing.net/",
      },
    ],
  },
];

export default function TextOverlay() {
  const year = new Date().getFullYear();
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="overlay-root">
      <div className="hero-wrap">
        <header className="hero-card">
          <p className="hero-kicker">Shrikar Bidaeet</p>
          <h1
            className="hero-text"
            onMouseEnter={(e) =>
              scrambleText(e.currentTarget, "Frontend Developer")
            }
          >
            Frontend Developer
          </h1>
          <p className="hero-subtitle">
            Building responsive, visual-first web experiences with React and
            modern frontend tooling.
          </p>
          <div className="hero-tags" aria-label="Core skills">
            <span>React</span>
            <span>Three.js</span>
            <span>GSAP</span>
            <span>UI Engineering</span>
            <span>blender</span>
            <span>adobe softwares</span>
          </div>
          <div className="hero-cta">
            <a href="#projects">View Projects</a>
            <a href="/resume.pdf" download>
              Download Resume
            </a>
            <a
              href="https://github.com/shrikarbide"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Profile
            </a>
          </div>
        </header>
      </div>

      {aboutBlocks.map((block, index) => (
        <section
          key={block.title}
          className={`overlay-section ${block.offsetClass} ${block.side}`}
          id={block.title === "PROJECTS" ? "projects" : undefined}
        >
          <div
            className="overlay-card"
            style={{ "--float-delay": `${index * 120}ms` }}
            ref={(element) => {
              cardRefs.current[index] = element;
            }}
          >
            <h2>{block.title}</h2>
            {block.isExperience ? (
              <div className="experience-list">
                {block.roles.map((item) => (
                  <article
                    key={`${item.company}-${item.role}`}
                    className="experience-item"
                  >
                    <h3>
                      {item.role} - {item.company}
                    </h3>
                    <p className="experience-meta">
                      {item.duration} | {item.location}
                    </p>
                    <ul>
                      {item.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            ) : block.isSkillset ? (
              <div className="hero-tags" aria-label="Skillset tags">
                {block.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            ) : block.isProjects ? (
              <div className="experience-list">
                {block.projects.map((project) => (
                  <article key={project.name} className="experience-item">
                    <h3>{project.name}</h3>
                    <p className="experience-meta">Tech: {project.tech}</p>
                    <p>{project.summary}</p>
                    <p className="experience-meta">
                      Live:{" "}
                      {project.live.startsWith("http") ? (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {project.live}
                        </a>
                      ) : (
                        project.live
                      )}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p>{block.body}</p>
            )}
          </div>
        </section>
      ))}

      <footer className="overlay-footer">
        <p>Open to frontend roles.</p>
        <p className="footer-meta">
          © {year} SHRIKAR • Crafted with React, Three.js, and GSAP
        </p>
      </footer>
    </div>
  );
}
