import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { SignboardSubmission, CityMemoryContextType, SubmissionStatus, StoryInfo, Signboard } from '../types';
import { useSignboards } from './SignboardsContext';
import { useCollections } from './CollectionsContext';

const CityMemoryContext = createContext<CityMemoryContextType | undefined>(undefined);

const generateId = () => `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const STORAGE_KEY = 'city-memory-submissions';

const defaultSubmissions: SignboardSubmission[] = [
  {
    id: 'mem-demo-1',
    shopName: '老北京爆肚冯',
    location: '北京西城区门框胡同',
    era: '清末',
    year: 1880,
    description: '门框胡同百年老店，招牌为传统黑底金字，据传由清宫御厨题写。',
    fontStyle: '楷书',
    colors: ['#000000', '#FFD700', '#8B0000'],
    buildingType: '中式传统',
    photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old%20beijing%20restaurant%20signboard%20black%20gold%20traditional%20calligraphy%20qing%20dynasty&image_size=square'],
    contributorName: '冯建国',
    contactInfo: '138****5678',
    stories: [
      {
        title: '五代人的传承',
        content: '我家祖上传下来的爆肚手艺，从清朝光绪年间开始，到我这已经是第五代了。这块招牌见证了我们家族的兴衰，也见证了门框胡同的变迁。小时候爷爷常说，招牌就是脸面，字要正，心也要正。',
        author: '冯建国',
        relationship: '第五代传人',
        year: 1880
      }
    ],
    status: 'pending',
    submitTime: Date.now() - 86400000 * 3,
    tags: ['北京小吃', '百年传承', '门框胡同']
  },
  {
    id: 'mem-demo-2',
    shopName: '上海哈尔滨食品厂',
    location: '上海黄浦区淮海中路',
    era: '1930s',
    year: 1936,
    description: '哈尔滨食品厂是上海著名的西点老字号，招牌采用Art Deco风格艺术字，蓝底白字十分醒目。',
    fontStyle: '艺术字',
    colors: ['#1E3A8A', '#FFFFFF', '#DC143C'],
    buildingType: '百货大楼',
    photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=1930s%20shanghai%20bakery%20signboard%20art%20deco%20style%20blue%20white%20vintage&image_size=square'],
    contributorName: '李明华',
    stories: [
      {
        title: '童年的奶油香',
        content: '小时候最期待的就是过年过节，爸妈带着我到哈尔滨食品厂买奶油蛋糕。那时候觉得这块招牌特别高大，字也特别好看。现在每次路过，还能闻到那熟悉的奶油香。',
        author: '李明华',
        relationship: '老顾客',
        year: 1960
      }
    ],
    status: 'approved',
    submitTime: Date.now() - 86400000 * 7,
    reviewTime: Date.now() - 86400000 * 5,
    reviewerNote: '资料详实，历史价值高，建议入册',
    tags: ['西点', '上海老字号', 'Art Deco']
  }
];

export const CityMemoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addSignboard } = useSignboards();
  const { addToCollection } = useCollections();

  const [submissions, setSubmissions] = useState<SignboardSubmission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultSubmissions;
      }
    }
    return defaultSubmissions;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  }, [submissions]);

  const submitClue = useCallback((data: Omit<SignboardSubmission, 'id' | 'status' | 'submitTime' | 'stories'>): SignboardSubmission => {
    const newSubmission: SignboardSubmission = {
      ...data,
      id: generateId(),
      status: 'pending',
      submitTime: Date.now(),
      stories: []
    };
    setSubmissions(prev => [newSubmission, ...prev]);
    return newSubmission;
  }, []);

  const addStory = useCallback((submissionId: string, story: Omit<StoryInfo, 'id'>) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id !== submissionId) return sub;
      return {
        ...sub,
        stories: [...sub.stories, { ...story }]
      };
    }));
  }, []);

  const updateSubmission = useCallback((id: string, updates: Partial<SignboardSubmission>) => {
    setSubmissions(prev => prev.map(sub =>
      sub.id === id ? { ...sub, ...updates } : sub
    ));
  }, []);

  const reviewSubmission = useCallback((id: string, status: 'approved' | 'rejected', note?: string) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id !== id) return sub;
      return {
        ...sub,
        status,
        reviewTime: Date.now(),
        reviewerNote: note
      };
    }));
  }, []);

  const publishToCollection = useCallback((submissionId: string, collectionId: string, note?: string): Signboard | null => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission || submission.status !== 'approved') return null;

    const signboardData: Omit<Signboard, 'id'> = {
      name: submission.shopName,
      shopName: submission.shopName,
      era: submission.era,
      year: submission.year || new Date().getFullYear(),
      location: submission.location,
      fontStyle: submission.fontStyle || '楷书',
      fontFamily: 'Traditional Kai',
      colors: submission.colors || ['#8B4513', '#FFD700'],
      description: submission.description + (submission.stories.length > 0 ? `\n\n征集故事：${submission.stories[0].title} - ${submission.stories[0].content}` : ''),
      image: submission.photos[0] || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`vintage chinese ${submission.shopName} signboard`)}&image_size=square`,
      tags: [...(submission.tags || []), '市民征集'],
      condition: 'well-preserved',
      buildingType: submission.buildingType || '其他',
      restorationHistory: [{
        year: submission.year || new Date().getFullYear(),
        era: submission.era,
        type: 'creation',
        title: '市民征集入册',
        description: `由市民${submission.contributorName}征集提供，经审核后入册。${submission.stories.length > 0 ? `附带故事：${submission.stories[0].title}` : ''}`,
        changes: {
          colors: submission.colors || ['#8B4513', '#FFD700'],
          condition: 'well-preserved'
        }
      }]
    };

    const newSignboard = addSignboard(signboardData);

    if (collectionId) {
      addToCollection(collectionId, newSignboard.id, note || `来自城市记忆征集：${submission.shopName}`);
    }

    setSubmissions(prev => prev.map(sub => {
      if (sub.id !== submissionId) return sub;
      return {
        ...sub,
        status: 'published',
        signboardId: newSignboard.id
      };
    }));

    return newSignboard;
  }, [submissions, addSignboard, addToCollection]);

  const getSubmission = useCallback((id: string): SignboardSubmission | undefined => {
    return submissions.find(s => s.id === id);
  }, [submissions]);

  const getSubmissionsByStatus = useCallback((status: SubmissionStatus): SignboardSubmission[] => {
    return submissions.filter(s => s.status === status);
  }, [submissions]);

  const getSubmissionsByContributor = useCallback((name: string): SignboardSubmission[] => {
    return submissions.filter(s => s.contributorName === name);
  }, [submissions]);

  const deleteSubmission = useCallback((id: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== id));
  }, []);

  const value = useMemo<CityMemoryContextType>(() => ({
    submissions,
    submitClue,
    addStory,
    updateSubmission,
    reviewSubmission,
    publishToCollection,
    getSubmission,
    getSubmissionsByStatus,
    getSubmissionsByContributor,
    deleteSubmission
  }), [
    submissions,
    submitClue,
    addStory,
    updateSubmission,
    reviewSubmission,
    publishToCollection,
    getSubmission,
    getSubmissionsByStatus,
    getSubmissionsByContributor,
    deleteSubmission
  ]);

  return (
    <CityMemoryContext.Provider value={value}>
      {children}
    </CityMemoryContext.Provider>
  );
};

export const useCityMemory = () => {
  const context = useContext(CityMemoryContext);
  if (!context) throw new Error('useCityMemory must be used within CityMemoryProvider');
  return context;
};
