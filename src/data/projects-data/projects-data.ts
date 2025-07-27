export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
}

export const projectsData: Project[] = [
  {
    id: "codahx",
    title: "CodaHx, Inc.",
    description: "AI-driven analysis to help you navigate each stage of maternity care billing, from pregnancy through delivery and beyond.",
    image: "/projects/codahx/codahx-thumbnail.png",
    tags: ["Next.js", "RAG", "AWS"],
    link: "https://www.codahx.com"
  },
  {
    id: "prostate-segmentation",
    title: "Prostate & Cancer Lesion Segmentation using Transformer-U-Net",
    description: "Transformer-U-Net deep learning model for detecting and segmenting prostate and cancer lesions in MRI scans to support faster, more precise treatment planning.",
    image: "/projects/ml-prostate-segmentation/ml-prostate-segmentation-thumbnail.png",
    tags: ["PyTorch", "Transformer", "U-Net", "Medical Imaging"],
    link: "https://drive.google.com/file/d/1WuoOK2rMWTmDD39PTFoEAoEXBx2hYG0a"
  },
  {
    id: "ray-tracing-opengl-cg",
    title: "Ray Tracing and OpenGL Renderer",
    description: "Built a custom ray tracer from scratch supporting reflection, refraction, shadows, shading, and texture mapping. Extended the same scene functionality using OpenGL for real-time rendering with interactive camera controls.",
    image: "/projects/ray-tracing-opengl-cg/ray-tracing-opengl-cg-thumbnail.gif",
    tags: ["C++", "Ray Tracing", "OpenGL", "Computer Graphics"],
    link: "https://www.cs.jhu.edu/~misha/Spring25/Assignments/Assignment2/"
  },
  {
    id: "pose-estimation-cv",
    title: "Pose Estimation Model Comparison",
    description: "Developed and benchmarked four human pose estimation models—AlphaPose, OpenPose, PoseNet, and HRNet—on the COCO 2017 dataset. Evaluated performance under occlusion and clean conditions using metrics like mAP, AP, AR, and AUC to assess keypoint detection precision and recall.",
    image: "/projects/cv-pose-estimation/cv-pose-estimation-thumbnail.png",
    tags: ["PyTorch", "CNN", "Heatmap Regression", "Human Keypoint Detection", "mAP", "AlphaPose", "HRNet", "OpenPose", "PoseNet"],
    link: "https://drive.google.com/file/d/1vpm_-lATFZFHp_J4ObsXTZz2KoxwSapt"
  }
];