# AI Image Studio

AI Image Studio is a full-stack web application that enables users to generate images from text prompts and obtain meaningful descriptions from uploaded images. The project is designed with a focus on clean architecture, efficient AI service usage, and scalability while maintaining a smooth user experience.

## Features

- Text-to-image generation using AI models  
- Image-to-text description for uploaded images  
- User authentication with secure password hashing  
- Personal image gallery with delete functionality  
- Optimized usage of free-tier AI services by splitting workloads  

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- JavaScript (ES6+)

### Backend
- FastAPI
- MongoDB
- Pydantic
- Passlib (bcrypt)

### AI Services
- Hugging Face Inference API (Stable Diffusion XL) for image generation
- Image captioning model for image description

## Architecture

The frontend communicates with a FastAPI backend that manages authentication, database operations, and AI service interactions. AI workloads are intentionally split across different services to reduce dependency on a single provider and to improve performance and reliability while staying within free-tier limits.

## Objectives

- Build a real-world AI-powered web application  
- Practice full-stack development with modern tools  
- Efficiently utilize free-tier AI services  
- Implement secure authentication and data handling  
- Design a scalable and maintainable system  

## Contact

**Prakhar Srivastava**  
GitHub: https://github.com/TechNinja-dev  
Email: 
LinkedIn: 
Portfolio: 
