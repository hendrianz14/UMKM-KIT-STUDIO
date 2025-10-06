// components/project-card.tsx
'use client';

import React from 'react';
import { EditorIcon, ShareIcon } from '../lib/icons';
import { Project } from '../lib/types';

interface ProjectCardProps {
  project: Project;
  onShareClick: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onShareClick }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group animate-fadeInUp">
      <div className="w-full aspect-[3/4] overflow-hidden bg-gray-50 p-3">
        <img 
          src={project.imageUrl} 
          alt={project.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg" 
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-[#0D47A1] truncate">{project.title}</h3>
        <p 
          className="text-sm text-gray-500 mb-4 h-10"
          style={{ 
            overflow: 'hidden', 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical' 
          }}
        >
          {project.type}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex space-x-2">
            <button 
              onClick={() => onShareClick(project)}
              className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-[#1565C0] bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
              <ShareIcon className="w-4 h-4 mr-2" />
              Bagikan
            </button>
            <button className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-[#1565C0] bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
              <EditorIcon className="w-4 h-4 mr-2" />
              Edit
            </button>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">3:4</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
