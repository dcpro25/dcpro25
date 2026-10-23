import React, { useState, useEffect, useRef } from 'react';
import buildingDroneWashImg from './assets/images/building_drone_wash_1784877433334.jpg';
import aisoDroneRealPhotoImg from './assets/images/aiso_drone_real_photo_1784877676972.jpg';
import solarPanelCleaningImg from './assets/images/solar_panel_cleaning_1784697053787.jpg';
import purewaterTechWashImg from './assets/images/purewater_tech_wash_1784686327503.jpg';
import carWashPressureWaterImg from './assets/images/car_wash_pressure_water_1784697034670.jpg';
import tetheredDroneDiagramImg from './assets/images/tethered_drone_diagram_1784697741824.jpg';
import droneHeroCleaningImg from './assets/images/drone_hero_cleaning_1784686301201.jpg';
import logoIconImg from './assets/images/logo_icon_1784876769539.jpg';
import {
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Clock,
  Building2,
  Sun,
  Maximize2,
  Paintbrush,
  CheckCircle2,
  Zap,
  Droplets,
  ArrowRight,
  Phone,
  Mail,
  User,
  Calculator,
  ChevronRight,
  X,
  Send,
  Check,
  FileText,
  Layers,
  MapPin,
  RefreshCw,
  Award,
  CheckCircle,
  HelpCircle,
  AppWindow,
  ExternalLink,
  Youtube,
  Search,
  Filter,
  ListFilter,
  Calendar,
  Building,
  Eye,
  EyeOff,
  ListOrdered,
  MessageSquare,
  Lock,
  Unlock,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Upload,
  Download,
  Trash2,
  Camera,
  RotateCcw,
  Settings,
  Edit3,
  FileImage,
  FolderOpen,
  FileEdit,
  ClipboardList,
  ArrowUp,
  GraduationCap,
  PhoneCall,
  Menu,
  ArrowRightLeft
} from 'lucide-react';
import EducationPage from './EducationPage';

// Safe Web Storage utilities to prevent QuotaExceededError from crashing the React app
const safeLocalStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`[Storage] localStorage.getItem failed for "${key}":`, e);
    return null;
  }
};

const safeLocalStorageSet = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`[Storage] localStorage.setItem failed for "${key}":`, e);
    // Self-healing: if quota exceeded, keep URLs and prune oversized base64 strings
    try {
      if (key === 'dronecleanpro_site_images') {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'object' && parsed !== null) {
            const streamlined: Record<string, string> = {};
            for (const [k, v] of Object.entries(parsed)) {
              if (typeof v === 'string') {
                // Always keep normal web URLs; only prune excessively large data URLs
                if (!v.startsWith('data:') || v.length < 180000) {
                  streamlined[k] = v;
                }
              }
            }
            localStorage.removeItem('dronecleanpro_site_images');
            localStorage.setItem(key, JSON.stringify(streamlined));
            return true;
          }
        } catch (_) {
          // ignore parse error
        }
        localStorage.removeItem('dronecleanpro_site_images');
      }
      localStorage.setItem(key, value);
      return true;
    } catch (_) {
      return false;
    }
  }
};

const safeLocalStorageRemove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`[Storage] localStorage.removeItem failed for "${key}":`, e);
  }
};

const safeSessionStorageGet = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    console.warn(`[Storage] sessionStorage.getItem failed for "${key}":`, e);
    return null;
  }
};

const safeSessionStorageSet = (key: string, value: string): boolean => {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`[Storage] sessionStorage.setItem failed for "${key}":`, e);
    return false;
  }
};

const safeSessionStorageRemove = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.warn(`[Storage] sessionStorage.removeItem failed for "${key}":`, e);
  }
};

// Video detection helper utility for MP4, WEBM, MOV, M4V, etc.
const isVideoUrl = (url?: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.startsWith('data:video/')) return true;
  if (
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.m4v') ||
    lower.endsWith('.ogg') ||
    lower.endsWith('.avi') ||
    lower.endsWith('.mkv')
  ) {
    return true;
  }
  if (
    lower.includes('.mp4?') ||
    lower.includes('.webm?') ||
    lower.includes('.mov?') ||
    lower.includes('.m4v?') ||
    lower.includes('.ogg?')
  ) {
    return true;
  }
  return false;
};

// Comprehensive media file validator (supports PNG, GIF, JIF, JFIF, JPG, WEBP, MP4, etc.)
const isValidMediaFile = (file: File): boolean => {
  if (file.type && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
    return true;
  }
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.gif') ||
    name.endsWith('.jif') ||
    name.endsWith('.jfif') ||
    name.endsWith('.webp') ||
    name.endsWith('.svg') ||
    name.endsWith('.bmp') ||
    name.endsWith('.mp4') ||
    name.endsWith('.webm') ||
    name.endsWith('.mov') ||
    name.endsWith('.m4v') ||
    name.endsWith('.avi')
  );
};

export interface ProcessedUrlResult {
  url: string;
  isLocalPath: boolean;
  localPathMessage?: string;
}

// Smart URL processor: strips quotes, extracts markdown/HTML tags, detects local paths, converts Google Drive/Dropbox links
export const processImageUrlInput = (raw: string): ProcessedUrlResult => {
  let cleaned = raw.trim();

  // Strip wrapping quotes (e.g. from Windows "Copy path" or copied strings)
  cleaned = cleaned.replace(/^["'`]|["'`]$/g, '').trim();

  // Detect local computer file paths (Windows C:\, Mac /Users/, file:///)
  const isLocal =
    /^[a-zA-Z]:[\\/]/.test(cleaned) ||
    cleaned.startsWith('file://') ||
    cleaned.startsWith('/Users/') ||
    cleaned.startsWith('/home/') ||
    cleaned.startsWith('\\\\');

  if (isLocal) {
    return {
      url: cleaned,
      isLocalPath: true,
      localPathMessage:
        '컴퓨터에 저장된 로컬 파일 경로(예: C:\\... 또는 file://)는 웹 브라우저의 보안 정책상 URL 주소로 직접 불러올 수 없습니다. 좌측의 [1. 내 컴퓨터 사진 / 동영상 업로드] 버튼의 [파일 선택하기]를 통해 해당 파일을 직접 선택하시거나, 이 카드 영역으로 해당 파일을 마우스로 끌어다 놓으시면(드래그 앤 드롭) 즉시 등록됩니다.',
    };
  }

  // Extract from markdown format: ![alt](url)
  const mdMatch = cleaned.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/i);
  if (mdMatch) cleaned = mdMatch[1].trim();

  // Extract from html img tag: <img src="url" ...>
  const htmlMatch = cleaned.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  if (htmlMatch) cleaned = htmlMatch[1].trim();

  // Extract from css url(): url('...')
  const cssMatch = cleaned.match(/^url\((.*)\)$/i);
  if (cssMatch) cleaned = cssMatch[1].replace(/^["']|["']$/g, '').trim();

  // Protocol relative url: //example.com/photo.png -> https://example.com/photo.png
  if (cleaned.startsWith('//')) {
    cleaned = 'https:' + cleaned;
  }

  // Google Drive share link converter
  // https://drive.google.com/file/d/FILE_ID/view?usp=sharing -> https://drive.google.com/uc?export=view&id=FILE_ID
  const gDriveMatch = cleaned.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch && gDriveMatch[1]) {
    cleaned = `https://drive.google.com/uc?export=view&id=${gDriveMatch[1]}`;
  }

  // Dropbox share link converter
  if (cleaned.includes('dropbox.com') && cleaned.includes('?dl=0')) {
    cleaned = cleaned.replace('?dl=0', '?raw=1');
  }

  return {
    url: cleaned,
    isLocalPath: false,
  };
};

// Canvas-based image compression utility (supports JIF, GIF animations, and PNG transparency preservation)
const compressImageFile = (file: File, maxWidth = 1080, maxHeight = 1080, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return reject(new Error('Failed to read file'));

      const lowerName = file.name.toLowerCase();
      const isGifOrJif =
        file.type === 'image/gif' ||
        file.type === 'image/jif' ||
        file.type === 'image/jfif' ||
        lowerName.endsWith('.gif') ||
        lowerName.endsWith('.jif') ||
        lowerName.endsWith('.jfif') ||
        src.startsWith('data:image/gif');

      const isVideo =
        file.type.startsWith('video/') ||
        lowerName.endsWith('.mp4') ||
        lowerName.endsWith('.webm') ||
        lowerName.endsWith('.mov') ||
        lowerName.endsWith('.m4v') ||
        src.startsWith('data:video/');

      // Preserve GIF/JIF animations and video files by returning raw data URL directly
      if (isGifOrJif || isVideo) {
        return resolve(src);
      }

      const isPng =
        file.type === 'image/png' ||
        lowerName.endsWith('.png') ||
        src.startsWith('data:image/png');

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // If PNG, preserve transparent pixels rather than blackening them with JPEG conversion
          if (isPng) {
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(canvas.toDataURL('image/jpeg', quality));
          }
        } else {
          resolve(src);
        }
      };
      img.onerror = () => resolve(src);
      img.src = src;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export interface InquiryItem {
  id: string;
  title: string;
  password?: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  serviceType: string;
  buildingDetails: string;
  requestTest: boolean;
  createdAt: string;
  status: '접수완료' | '상담대기' | '방문견적 예정' | '답변완료';
  photos?: string[];
  reply?: string;
  replyCreatedAt?: string;
}

const INITIAL_INQUIRIES: InquiryItem[] = [
  {
    id: 'INQ-2026-004',
    title: '서울 서초구 15층 커튼월 빌딩 외벽 고압세척 및 시범 테스트 요청',
    password: '1234',
    name: '김경태 팀장',
    company: '(주)한성커튼월 타워',
    phone: '010-3856-8912',
    email: 'kt.kim@hansung.com',
    serviceType: '건축물 외벽 고압세척',
    buildingDetails: '서울 서초구 15층 커튼월 유리/알루미늄 복합판넬 외벽 세척 및 1층 시범 테스트 요청',
    requestTest: true,
    createdAt: '2026-07-22 14:30',
    status: '방문견적 예정',
    reply: '안녕하세요. 드론클린프로 조영수 이사입니다. 신청해주신 담당자분과 통화 완료하였으며, 7월 24일(금) 오후 2시에 현장 방문하여 구역 측정 및 1층 시범 세척을 진행할 예정입니다.',
    replyCreatedAt: '2026-07-22 15:10'
  },
  {
    id: 'INQ-2026-003',
    title: '충남 서산 지붕형 태양광 패널 3,500m² 세척 및 수율 개선 테스트',
    password: '1234',
    name: '이정훈 센터장',
    company: '삼양태양광발전소',
    phone: '010-9128-1204',
    email: 'jh.lee@samyangsolar.co.kr',
    serviceType: '태양광 패널 클리닝',
    buildingDetails: '충남 서산 지붕형 태양광 패널 약 3,500m² 세척 및 수율 개선 테스트',
    requestTest: true,
    createdAt: '2026-07-22 11:15',
    status: '상담대기'
  },
  {
    id: 'INQ-2026-002',
    title: '마포 자이 아파트 12개동 재도장 공사 전 외벽 고압세척 견적 문의',
    password: '1234',
    name: '박서연 관리소장',
    company: '마포 자이 아파트 입주자대표회의',
    phone: '010-5421-4530',
    email: 'mapo_j@naver.com',
    serviceType: '아파트 재도장 전 고압세척',
    buildingDetails: '12개동 25층 아파트 재도장 공사 전 수성페인트 및 먼지 제거 고압세척 견적',
    requestTest: false,
    createdAt: '2026-07-21 16:45',
    status: '접수완료'
  },
  {
    id: 'INQ-2026-001',
    title: '경기 이천 물류센터 외곽 고층 유리창 퓨어워터 세척 견적',
    password: '1234',
    name: '최현우 이사',
    company: '에이플러스 로지스틱스',
    phone: '010-7632-9081',
    email: 'hw.choi@aplogis.com',
    serviceType: '고층 유리창 퓨어워터 세척',
    buildingDetails: '경기 이천 물류센터 외곽 유리창 및 샌드위치 판넬 먼지 세척 문의',
    requestTest: true,
    createdAt: '2026-07-20 09:20',
    status: '답변완료',
    reply: '드론클린프로입니다. 이천 물류센터 건에 대한 맞춤 드론 세척 가견적서 및 세부 시범 세척 일정 안내서를 등록해주신 이메일로 발송해 드렸습니다. 감사합니다.',
    replyCreatedAt: '2026-07-20 11:00'
  }
];

export interface SiteImageConfig {
  key: string;
  title: string;
  category: '메인 화면' | '주요 세척 서비스' | '특허 및 기술 소개' | '서비스 상세 팝업' | '브랜드 로고';
  description: string;
  defaultUrl: string;
}

export const DEFAULT_SITE_IMAGES: Record<string, SiteImageConfig> = {
  logo: {
    key: 'logo',
    title: '상단 & 하단 로고 이미지 (1080 × 1080px)',
    category: '브랜드 로고',
    description: '헤더 상단 로고 및 푸터 하단 브랜드 표시 마크 (권장 규격: 1080 × 1080px)',
    defaultUrl: logoIconImg,
  },
  hero_main: {
    key: 'hero_main',
    title: '메인 화면 히어로 대표 세척 사진 1',
    category: '메인 화면',
    description: '홈페이지 최상단 대표 세척 현장 사진 1',
    defaultUrl: buildingDroneWashImg,
  },
  hero_main_2: {
    key: 'hero_main_2',
    title: '메인 화면 히어로 대표 세척 사진 2',
    category: '메인 화면',
    description: '홈페이지 최상단 대표 세척 현장 사진 2',
    defaultUrl: droneHeroCleaningImg,
  },
  service_01: {
    key: 'service_01',
    title: '01. 건축물 외벽 세척 카탈로그 사진',
    category: '주요 세척 서비스',
    description: '주요 사업 영역 - 01. 건축물 외벽 세척 대표 카드 이미지',
    defaultUrl: aisoDroneRealPhotoImg,
  },
  service_02: {
    key: 'service_02',
    title: '02. 태양광 패널 클리닝 카탈로그 사진',
    category: '주요 세척 서비스',
    description: '주요 사업 영역 - 02. 태양광 패널 클리닝 대표 카드 이미지',
    defaultUrl: solarPanelCleaningImg,
  },
  service_03: {
    key: 'service_03',
    title: '03. 유리창 세척 카탈로그 사진',
    category: '주요 세척 서비스',
    description: '주요 사업 영역 - 03. 유리창 세척 대표 카드 이미지',
    defaultUrl: purewaterTechWashImg,
  },
  service_04: {
    key: 'service_04',
    title: '04. 재도장 전 고압세척 카탈로그 사진',
    category: '주요 세척 서비스',
    description: '주요 사업 영역 - 04. 재도장 전 고압세척 대표 카드 이미지',
    defaultUrl: carWashPressureWaterImg,
  },
  tech_nozzle: {
    key: 'tech_nozzle',
    title: '기술소개 01. 드론 전용 특수 노즐 사진',
    category: '특허 및 기술 소개',
    description: '특허 기술 01 - 드론클린프로 자체개발 드론 전용 특수 노즐 사진',
    defaultUrl: droneHeroCleaningImg,
  },
  tech_tethered: {
    key: 'tech_tethered',
    title: '기술소개 02. 수직하향계류식 드론 구조 사진',
    category: '특허 및 기술 소개',
    description: '특허 기술 02 - 수직하향계류방식 특허 드론 구조 및 현장 사진',
    defaultUrl: tetheredDroneDiagramImg,
  },
  tech_carwash: {
    key: 'tech_carwash',
    title: '기술소개 03. 일반 세차장/고압세척기 비교 사진',
    category: '특허 및 기술 소개',
    description: '특허 기술 03 - 일반 세차장 스펙 비교 카드 사진',
    defaultUrl: carWashPressureWaterImg,
  },
  tech_carwash_sub: {
    key: 'tech_carwash_sub',
    title: '기술소개 03. 드론클린프로 고압세척 현장 사진',
    category: '특허 및 기술 소개',
    description: '특허 기술 03 - 드론클린프로 고압세척 현장 카드 사진',
    defaultUrl: droneHeroCleaningImg,
  },
  tech_purewater: {
    key: 'tech_purewater',
    title: '기술소개 04. 초순수 퓨어워터 세척 현장 사진',
    category: '특허 및 기술 소개',
    description: '특허 기술 04 - 퓨어워터 정제 세척 현장 사진',
    defaultUrl: purewaterTechWashImg,
  },
  modal_building: {
    key: 'modal_building',
    title: '세척 비교 슬라이더: 건물 외벽 세척 전/후 사진',
    category: '서비스 상세 팝업',
    description: '서비스 소개 팝업 내 건물 외벽 세척 비포/애프터 비교 이미지',
    defaultUrl: droneHeroCleaningImg,
  },
  modal_solar: {
    key: 'modal_solar',
    title: '세척 비교 슬라이더: 태양광 패널 세척 전/후 사진',
    category: '서비스 상세 팝업',
    description: '서비스 소개 팝업 내 태양광 패널 세척 비포/애프터 비교 이미지',
    defaultUrl: solarPanelCleaningImg,
  },
};

function SlotItemCard({
  slot,
  currentUrl,
  isDefault,
  isFocused,
  onUpdateImage,
  onResetImage,
}: {
  slot: {
    key: string;
    title: string;
    category: string;
    description: string;
    defaultUrl: string;
  };
  currentUrl: string;
  isDefault: boolean;
  isFocused: boolean;
  onUpdateImage: (key: string, newUrl: string) => void;
  onResetImage: (key: string) => void;
}) {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlValidationStatus, setUrlValidationStatus] = useState<
    'idle' | 'checking' | 'valid' | 'invalid' | 'localPath'
  >('idle');
  const [urlValidationMsg, setUrlValidationMsg] = useState('');

  // Reset thumbnail error when currentUrl changes
  useEffect(() => {
    setThumbnailError(false);
  }, [currentUrl]);

  const handleProcessFile = async (file: File) => {
    if (!isValidMediaFile(file)) {
      alert('이미지 및 동영상 파일(PNG, GIF/JIF, JPG, WEBP, MP4 등)만 등록 가능합니다.');
      return;
    }
    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1080, 1080, 0.85);
      onUpdateImage(slot.key, compressedDataUrl);
    } catch (e) {
      alert('파일 업로드 처리 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlInputChange = (val: string) => {
    setUrlInput(val);
    const trimmed = val.trim();
    if (!trimmed) {
      setUrlValidationStatus('idle');
      setUrlValidationMsg('');
      return;
    }

    const processed = processImageUrlInput(trimmed);
    if (processed.isLocalPath) {
      setUrlValidationStatus('localPath');
      setUrlValidationMsg(
        '컴퓨터 로컬 파일 경로(C:\\... 등)는 웹 브라우저의 보안 정책상 URL로 직접 불러올 수 없습니다. 좌측의 [파일 선택하기] 버튼 또는 카드로 파일을 직접 끌어다 놓으시면(드래그 앤 드롭) 바로 등록됩니다.'
      );
      return;
    }

    let testUrl = processed.url;
    if (
      !testUrl.startsWith('http://') &&
      !testUrl.startsWith('https://') &&
      !testUrl.startsWith('data:') &&
      !testUrl.startsWith('/')
    ) {
      if (testUrl.includes('.')) {
        testUrl = 'https://' + testUrl;
      } else {
        setUrlValidationStatus('invalid');
        setUrlValidationMsg('올바른 웹 주소(https://...) 형식이 아닙니다.');
        return;
      }
    }

    if (isVideoUrl(testUrl)) {
      setUrlValidationStatus('valid');
      setUrlValidationMsg('동영상 링크가 확인되었습니다. [적용] 버튼을 눌러주세요.');
      return;
    }

    // Verify image URL test
    setUrlValidationStatus('checking');
    setUrlValidationMsg('이미지 주소 유효성 확인 중...');

    const testImg = new Image();
    testImg.referrerPolicy = 'no-referrer';
    let isCurrent = true;

    testImg.onload = () => {
      if (!isCurrent) return;
      setUrlValidationStatus('valid');
      setUrlValidationMsg('유효한 이미지 링크가 확인되었습니다. [적용] 버튼을 눌러주세요.');
    };

    testImg.onerror = () => {
      if (!isCurrent) return;
      setUrlValidationStatus('invalid');
      setUrlValidationMsg('이미지를 불러올 수 없는 주소입니다. (외부 접근 제한 링크이거나 잘못된 주소)');
    };

    testImg.src = testUrl;
  };

  const handleApplyUrl = () => {
    const raw = urlInput.trim();
    if (!raw) {
      alert('이미지 URL 주소를 입력해 주세요.');
      return;
    }

    const processed = processImageUrlInput(raw);
    if (processed.isLocalPath) {
      alert(
        processed.localPathMessage ||
          '컴퓨터 로컬 파일 경로는 웹 URL로 직접 불러올 수 없습니다. 좌측의 [파일 선택하기]를 이용해 주세요.'
      );
      return;
    }

    let targetUrl = processed.url;
    if (
      !targetUrl.startsWith('http://') &&
      !targetUrl.startsWith('https://') &&
      !targetUrl.startsWith('data:') &&
      !targetUrl.startsWith('/')
    ) {
      if (targetUrl.includes('.')) {
        targetUrl = 'https://' + targetUrl;
      } else {
        alert('올바른 웹 이미지 주소(https://... 또는 /...)를 입력해 주세요.');
        return;
      }
    }

    onUpdateImage(slot.key, targetUrl);
    setUrlInput('');
    setUrlValidationStatus('idle');
    setUrlValidationMsg('');
  };

  return (
    <div
      className={`relative bg-white rounded-2xl border p-4 sm:p-5 shadow-sm transition-all ${
        isFocused
          ? 'border-[#1d61e8] ring-2 ring-[#1d61e8]/30 shadow-md bg-blue-50/20'
          : 'border-slate-200 hover:border-blue-300'
      } ${isDragging ? 'ring-4 ring-blue-500 bg-blue-50/50' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleProcessFile(file);
      }}
      onPaste={(e) => {
        const items = e.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              const file = items[i].getAsFile();
              if (file) {
                e.preventDefault();
                handleProcessFile(file);
                return;
              }
            }
          }
        }
      }}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#1d61e8]/90 text-white rounded-2xl z-30 flex flex-col items-center justify-center p-4 border-2 border-dashed border-white pointer-events-none animate-fadeIn">
          <Upload className="w-10 h-10 mb-2 animate-bounce text-white" />
          <p className="font-bold text-base">여기에 사진(PNG, GIF/JIF, JPG)을 놓으시면 즉시 적용됩니다!</p>
        </div>
      )}

      {/* Loading Overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-slate-900/70 text-white rounded-2xl z-30 flex flex-col items-center justify-center p-4 backdrop-blur-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6] mb-2" />
          <p className="font-bold text-sm">이미지 처리 및 적용 중입니다...</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Thumbnail Preview */}
        <div className="w-full md:w-56 shrink-0 space-y-2">
          <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group">
            {thumbnailError ? (
              <div className="absolute inset-0 bg-slate-900 text-white flex flex-col items-center justify-center p-2 text-center text-xs">
                <AlertTriangle className="w-6 h-6 text-amber-400 mb-1" />
                <span className="font-bold text-rose-300">이미지 로드 실패</span>
                <span className="text-[10px] text-slate-400 mt-0.5">외부 주소 접근 제한 또는 오타</span>
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailError(false);
                    onResetImage(slot.key);
                  }}
                  className="mt-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold border border-slate-600 cursor-pointer"
                >
                  기본 원본으로 복원
                </button>
              </div>
            ) : isVideoUrl(currentUrl) ? (
              <video
                src={currentUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                onError={() => setThumbnailError(true)}
              />
            ) : (
              <img
                src={currentUrl}
                alt={slot.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setThumbnailError(true)}
              />
            )}
            <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
              현재 노출 미디어
            </div>
            {!isDefault && (
              <div className="absolute bottom-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                수정됨
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              상태: <strong className={isDefault ? 'text-slate-700' : 'text-amber-600'}>{isDefault ? '기본 원본' : '사용자 커스텀'}</strong>
            </span>
            {!isDefault && (
              <button
                type="button"
                onClick={() => onResetImage(slot.key)}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>원본 복원</span>
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="grow space-y-4 w-full">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-blue-100 text-[#1d61e8] text-xs font-bold border border-blue-200">
                {slot.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {slot.key}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{slot.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{slot.description}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            {/* File Upload Option */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#1d61e8]" />
                  <span>1. 내 컴퓨터 사진 / 동영상 업로드</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-[#1d61e8] font-bold border border-blue-200">
                  1080 × 1080px 최적화
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                사진(PNG, GIF/JIF, JPG, WEBP 등) 또는 동영상 파일 선택 시 1080 × 1080px 규격에 맞춰 고해상도 최적화 처리됩니다.
              </p>
              <label className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-white hover:bg-blue-50 text-[#1d61e8] font-bold text-xs rounded-lg border border-blue-200 shadow-sm cursor-pointer transition-all">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>사진/동영상 파일 선택하기 (1080 × 1080px)</span>
                <input
                  type="file"
                  accept="image/*,video/*,.gif,.png,.jpg,.jpeg,.jif,.jfif,.webp,.svg,.mp4,.webm,.mov,.m4v"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleProcessFile(f);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* URL Option */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#1d61e8]" />
                  <span>2. 이미지 URL 직접 입력</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Enter키로 적용</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                웹 이미지 주소(PNG, GIF/JIF, JPG 링크 등)를 복사하여 붙여넣으세요.
              </p>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="https://... 이미지 주소 붙여넣기"
                  value={urlInput}
                  onChange={(e) => handleUrlInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyUrl();
                    }
                  }}
                  className="grow px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#1d61e8] bg-white text-slate-900 font-sans"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 rounded-lg bg-[#1d61e8] hover:bg-[#1550c6] text-white text-xs font-bold shrink-0 shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  <span>적용</span>
                </button>
              </div>

              {/* Status feedback */}
              {urlValidationStatus === 'checking' && (
                <div className="text-[11px] text-blue-600 flex items-center gap-1.5 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  <span>{urlValidationMsg}</span>
                </div>
              )}
              {urlValidationStatus === 'valid' && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-200 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{urlValidationMsg}</span>
                </div>
              )}
              {urlValidationStatus === 'invalid' && (
                <div className="text-[11px] text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{urlValidationMsg}</span>
                </div>
              )}
              {urlValidationStatus === 'localPath' && (
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>로컬 컴퓨터 파일 경로 감지</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">{urlValidationMsg}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageManagerModal({
  isOpen,
  onClose,
  siteImages,
  onUpdateImage,
  onResetImage,
  onResetAllImages,
  onBatchImportImages,
  focusedKey,
}: {
  isOpen: boolean;
  onClose: () => void;
  siteImages: Record<string, string>;
  onUpdateImage: (key: string, newUrl: string) => void;
  onResetImage: (key: string) => void;
  onResetAllImages: () => void;
  onBatchImportImages?: (imported: Record<string, string>) => void;
  focusedKey: string | null;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categories = ['전체', '메인 화면', '주요 세척 서비스', '특허 및 기술 소개', '서비스 상세 팝업', '브랜드 로고'];
  const slotsList = Object.values(DEFAULT_SITE_IMAGES);

  const filteredSlots = slotsList.filter((slot) => {
    const matchesCat = selectedCategory === '전체' || slot.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      slot.title.toLowerCase().includes(query) ||
      slot.description.toLowerCase().includes(query) ||
      slot.key.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  const handleExportBackup = () => {
    try {
      const backupData = {
        app: 'DRONE_CLEAN_PRO',
        exportedAt: new Date().toISOString(),
        siteImages,
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dronecleanpro-images-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('백업 파일 생성 중 오류가 발생했습니다.');
    }
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const imagesToImport = parsed.siteImages || parsed.images || parsed;
        if (typeof imagesToImport === 'object' && imagesToImport !== null) {
          if (onBatchImportImages) {
            onBatchImportImages(imagesToImport);
          } else {
            for (const [k, v] of Object.entries(imagesToImport)) {
              if (typeof v === 'string') {
                onUpdateImage(k, v);
              }
            }
          }
          alert('설정 백업 파일이 성공적으로 복원되고 서버에 영구 동기화되었습니다.');
        } else {
          alert('올바른 이미지 설정 백업 JSON 파일이 아닙니다.');
        }
      } catch (err) {
        alert('백업 파일을 읽는 중 오류가 발생했습니다. 올바른 JSON 파일인지 확인해 주세요.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Hidden file input for backup restoration */}
      <input
        type="file"
        ref={backupFileInputRef}
        onChange={handleImportBackupFile}
        accept=".json"
        className="hidden"
      />

      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#0b1329] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1d61e8] text-white flex items-center justify-center shadow-lg border border-blue-400/30">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">사이트 게시 사진 & 이미지 관리자</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-bold">
                  관리자 권한
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  서버 영구 보존 활성화 (배포 및 공유 링크 동기화)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                사이트 내 모든 대표 사진 및 로고를 교체할 수 있습니다. 변경된 사진은 서버에 영구 보존되어 공유 링크 및 배포 환경에서도 모든 방문자에게 그대로 표시됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#1d61e8] text-white shadow-sm font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="사진 위치 / 제목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1d61e8] bg-white"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 grow bg-slate-100/70">
          {filteredSlots.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <FileImage className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-bold text-sm">해당 조건의 사진 항목이 없습니다.</p>
            </div>
          ) : (
            filteredSlots.map((slot) => {
              const currentUrl = siteImages[slot.key] || slot.defaultUrl;
              const isDefault = currentUrl === slot.defaultUrl;
              const isFocused = typeof focusedKey === 'string' && focusedKey.length > 0 && focusedKey === slot.key;

              return (
                <SlotItemCard
                  key={slot.key}
                  slot={slot}
                  currentUrl={currentUrl}
                  isDefault={isDefault}
                  isFocused={isFocused}
                  onUpdateImage={onUpdateImage}
                  onResetImage={onResetImage}
                />
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onResetAllImages}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>전체 원본 초기화</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1d61e8] font-bold text-xs border border-blue-200 flex items-center gap-1.5 transition-all cursor-pointer"
              title="현재 설정된 모든 사진 URL/데이터를 JSON 파일로 내보내어 안전하게 백업합니다."
            >
              <Download className="w-3.5 h-3.5 text-[#1d61e8]" />
              <span>설정 백업 (JSON)</span>
            </button>

            <button
              onClick={() => backupFileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
              title="이전에 백업해 둔 JSON 설정 파일을 불러와 모든 사진을 즉시 복원합니다."
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>설정 복원 (JSON)</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-[11px] text-slate-500 font-medium">
              ※ 서버 영구 저장 및 배포 환경 동기화 적용 중
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition-all cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Page Routing State: 'main' (세척 서비스) | 'education' (드론 세척 전문교육)
  const [currentPage, setCurrentPage] = useState<'main' | 'education'>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#education')) {
      return 'education';
    }
    return 'main';
  });

  useEffect(() => {
    // Dynamic favicon enforcement
    const updateFavicon = () => {
      let iconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = './favicon-32x32.png?v=2';
    };
    updateFavicon();

    const handleHashChange = () => {
      if (window.location.hash.startsWith('#education')) {
        setCurrentPage('education');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (!window.location.hash || window.location.hash === '#home' || window.location.hash === '') {
        setCurrentPage('main');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);


  const navigateToEducation = () => {
    setCurrentPage('education');
    window.location.hash = 'education';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToMain = () => {
    setCurrentPage('main');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quote Section Active Tab: 'new' (신규 견적문의) | 'my' (나의 견적문의 조회/관리)
  const [quoteActiveTab, setQuoteActiveTab] = useState<'new' | 'my'>('new');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [showEduConsultModal, setShowEduConsultModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin Authentication State (Persisted in sessionStorage)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return safeSessionStorageGet('dronecleanpro_admin_auth') === 'true';
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [adminToastMessage, setAdminToastMessage] = useState<string | null>(null);

  // Site Images State (persisted in localStorage and Server)
  const [siteImages, setSiteImages] = useState<Record<string, string>>(() => {
    const saved = safeLocalStorageGet('dronecleanpro_site_images');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          return { ...parsed };
        }
      } catch (e) {
        // fallback
      }
    }
    const initial: Record<string, string> = {};
    Object.keys(DEFAULT_SITE_IMAGES).forEach((k) => {
      initial[k] = DEFAULT_SITE_IMAGES[k].defaultUrl;
    });
    return initial;
  });

  // Fetch persistent site images from the server on startup & sync with server
  useEffect(() => {
    let isMounted = true;
    const syncSiteImagesWithServer = async () => {
      try {
        const res = await fetch('/api/site-images');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.images && isMounted) {
          const serverImages = data.images as Record<string, string>;
          const serverKeys = Object.keys(serverImages);

          if (serverKeys.length > 0) {
            // Apply server images to state and update localStorage cache
            setSiteImages((prev) => {
              const merged = { ...prev, ...serverImages };
              safeLocalStorageSet('dronecleanpro_site_images', JSON.stringify(merged));
              return merged;
            });
          } else {
            // Server has no saved images yet; check if current client has customized images in localStorage
            const localSaved = safeLocalStorageGet('dronecleanpro_site_images');
            if (localSaved) {
              try {
                const parsed = JSON.parse(localSaved);
                if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
                  // Push client's custom images to server so they are permanently saved!
                  fetch('/api/site-images', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ images: parsed }),
                  })
                    .then((r) => r.json())
                    .then((d) => {
                      if (d.success && d.images && isMounted) {
                        setSiteImages((prev) => ({ ...prev, ...d.images }));
                        safeLocalStorageSet('dronecleanpro_site_images', JSON.stringify(d.images));
                      }
                    })
                    .catch((err) => console.warn('[Storage] Auto-sync to server failed:', err));
                }
              } catch (_) {}
            }
          }
        }
      } catch (err) {
        console.warn('[Storage] Failed to fetch site images from server:', err);
      }
    };

    syncSiteImagesWithServer();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamic Favicon synchronization with current logo photo
  useEffect(() => {
    const currentLogo = getImage('logo');
    if (currentLogo) {
      let iconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = currentLogo;

      let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (appleLink) {
        appleLink.href = currentLogo;
      }
    }
  }, [siteImages]);

  const [showImageManagerModal, setShowImageManagerModal] = useState(false);
  const [focusedImageSlotKey, setFocusedImageSlotKey] = useState<string | null>(null);

  const getImage = (key: string): string => {
    return siteImages[key] || DEFAULT_SITE_IMAGES[key]?.defaultUrl || '';
  };

  const handleUpdateSiteImage = async (key: string, newUrl: string) => {
    const title = DEFAULT_SITE_IMAGES[key]?.title || key;

    // 1. Optimistic UI update
    const updated = { ...siteImages, [key]: newUrl };
    setSiteImages(updated);
    safeLocalStorageSet('dronecleanpro_site_images', JSON.stringify(updated));

    setAdminToastMessage(`'${title}' 사진 저장 중...`);

    // 2. Persist to server
    try {
      if (newUrl.startsWith('data:')) {
        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, dataUrl: newUrl }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.url) {
          const finalUrl = uploadData.url;
          setSiteImages((prev) => {
            const next = { ...prev, [key]: finalUrl };
            safeLocalStorageSet('dronecleanpro_site_images', JSON.stringify(next));
            return next;
          });
          setAdminToastMessage(`'${title}' 사진이 서버에 영구 보존되었습니다. (공유 링크 및 모든 방문자에게 즉시 반영)`);
        } else {
          setAdminToastMessage(`'${title}' 사진이 저장되었습니다.`);
        }
      } else {
        await fetch('/api/site-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: { [key]: newUrl } }),
        });
        setAdminToastMessage(`'${title}' 사진이 서버에 영구 보존되었습니다. (공유 링크 및 모든 방문자에게 즉시 반영)`);
      }
    } catch (err) {
      console.warn('[Storage] Failed to persist image to server:', err);
      setAdminToastMessage(`'${title}' 사진이 브라우저에 저장되었습니다.`);
    }

    setTimeout(() => setAdminToastMessage(null), 3500);
  };

  const handleBatchImportImages = async (imported: Record<string, string>) => {
    try {
      const merged = { ...siteImages, ...imported };
      setSiteImages(merged);
      safeLocalStorageSet('dronecleanpro_site_images', JSON.stringify(merged));

      const res = await fetch('/api/site-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imported }),
      });
      const data = await res.json();
      if (data.success && data.images) {
        setSiteImages((prev) => ({ ...prev, ...data.images }));
        safeLocalStorageSet('dronecleanpro_site_images', JSON.stringify(data.images));
      }
      setAdminToastMessage('백업 사진 설정이 성공적으로 복원되고 서버에 영구 동기화되었습니다.');
      setTimeout(() => setAdminToastMessage(null), 3500);
    } catch (e) {
      setAdminToastMessage('설정 복원 중 오류가 발생했습니다.');
      setTimeout(() => setAdminToastMessage(null), 3500);
    }
  };

  const handleResetSiteImage = async (key: string) => {
    const defaultUrl = DEFAULT_SITE_IMAGES[key]?.defaultUrl;
    if (defaultUrl) {
      const updated = { ...siteImages };
      delete updated[key];
      setSiteImages(updated);
      safeLocalStorageSet('dronecleanpro_site_images', JSON.stringify(updated));

      try {
        await fetch('/api/site-images/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key }),
        });
      } catch (e) {
        console.warn('[Storage] Reset failed on server:', e);
      }
      setAdminToastMessage(`'${DEFAULT_SITE_IMAGES[key]?.title || key}' 사진이 기본 원본으로 복원되었습니다.`);
      setTimeout(() => setAdminToastMessage(null), 3500);
    }
  };

  const handleResetAllSiteImages = async () => {
    if (confirm('사이트의 모든 게시 사진을 초기 원본 상태로 복원하시겠습니까?')) {
      const initial: Record<string, string> = {};
      Object.keys(DEFAULT_SITE_IMAGES).forEach((k) => {
        initial[k] = DEFAULT_SITE_IMAGES[k].defaultUrl;
      });
      setSiteImages(initial);
      safeLocalStorageRemove('dronecleanpro_site_images');

      try {
        await fetch('/api/site-images/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      } catch (e) {
        console.warn('[Storage] Reset all failed on server:', e);
      }
      setAdminToastMessage('모든 사진이 초기 원본 상태로 초기화되었습니다.');
      setTimeout(() => setAdminToastMessage(null), 3500);
    }
  };

  const handleOpenImageManager = (targetKey?: unknown) => {
    if (!isAdminAuthenticated) {
      setShowAdminLoginModal(true);
      setAdminAuthError('사이트 게시 사진을 수정하려면 관리자 로그인이 필요합니다. (비밀번호: 1234)');
      return;
    }
    if (typeof targetKey === 'string' && targetKey.trim()) {
      setFocusedImageSlotKey(targetKey.trim());
    } else {
      setFocusedImageSlotKey(null);
    }
    setShowImageManagerModal(true);
  };

  // Helper component for editable images & videos
  const EditableSiteImage = ({
    imageKey,
    alt,
    className,
    containerClassName = '',
    filterStyle,
    style,
  }: {
    imageKey: string;
    alt: string;
    className?: string;
    containerClassName?: string;
    filterStyle?: string;
    style?: React.CSSProperties;
  }) => {
    const srcUrl = getImage(imageKey);
    const isVideo = isVideoUrl(srcUrl);
    const defaultUrl = DEFAULT_SITE_IMAGES[imageKey]?.defaultUrl || '';
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
      setLoadFailed(false);
    }, [srcUrl]);

    const finalSrc = loadFailed ? defaultUrl : srcUrl;

    return (
      <div className={`relative group/img-edit ${containerClassName}`}>
        {isVideo ? (
          <video
            src={finalSrc}
            autoPlay
            loop
            muted
            playsInline
            className={`${className || ''} ${filterStyle || ''}`}
            style={style}
            onError={() => {
              if (!loadFailed && srcUrl !== defaultUrl) {
                setLoadFailed(true);
              }
            }}
          />
        ) : (
          <img
            src={finalSrc}
            alt={alt}
            className={`${className || ''} ${filterStyle || ''}`}
            style={style}
            referrerPolicy="no-referrer"
            onError={() => {
              if (!loadFailed && srcUrl !== defaultUrl) {
                console.warn(`[EditableSiteImage] Image failed to load for slot "${imageKey}":`, srcUrl);
                setLoadFailed(true);
              }
            }}
          />
        )}
        {loadFailed && isAdminAuthenticated && (
          <div className="absolute inset-x-2 bottom-2 z-20 bg-slate-900/90 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow backdrop-blur-xs flex items-center justify-between gap-2 border border-amber-400/40">
            <span className="flex items-center gap-1.5 truncate">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>입력된 이미지 주소를 불러올 수 없어 기본 사진으로 임시 대체 중입니다.</span>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOpenImageManager(imageKey);
              }}
              className="bg-[#1d61e8] hover:bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold shrink-0 cursor-pointer"
            >
              사진 다시 변경
            </button>
          </div>
        )}
        {isAdminAuthenticated && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleOpenImageManager(imageKey);
            }}
            className="absolute top-2 right-2 z-30 bg-slate-900/90 hover:bg-[#1d61e8] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/30 cursor-pointer hover:scale-105"
            title="이 사진/동영상 변경하기 (관리자 전용)"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
            <span>미디어 변경</span>
          </button>
        )}
      </div>
    );
  };

  // Hero section 5-second auto-slide state
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Session unlocked inquiry IDs (unlocked via password or created in current session)
  const [unlockedInquiryIds, setUnlockedInquiryIds] = useState<string[]>([]);
  const [detailPasswordInput, setDetailPasswordInput] = useState('');
  const [detailPasswordError, setDetailPasswordError] = useState('');

  // Admin Detail Edit State
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminStatusSelect, setAdminStatusSelect] = useState<InquiryItem['status']>('접수완료');

  // State for Sample Test Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalServiceType, setModalServiceType] = useState('건축물 외벽 세척');
  const [modalPhotos, setModalPhotos] = useState<string[]>([]);

  // State for Contact Form
  const [formData, setFormData] = useState({
    title: '',
    password: '',
    name: '',
    company: '',
    phone: '',
    email: '',
    serviceType: '건물외벽청소',
    buildingDetails: '',
    message: '',
    requestTest: false,
  });
  const [formPhotos, setFormPhotos] = useState<string[]>([]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitSuccessModal, setShowSubmitSuccessModal] = useState(false);

  // Inquiries State (with localStorage persistence)
  const [inquiries, setInquiries] = useState<InquiryItem[]>(() => {
    const saved = safeLocalStorageGet('dronecleanpro_inquiries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seenIds = new Set<string>();
          const processed = parsed.map((item: any, idx: number) => {
            let cleanPhone = item.phone || '010-8564-2682';
            if (cleanPhone.includes('***')) {
              cleanPhone = cleanPhone.replace('***', '8564');
            }
            let itemId = item.id;
            if (!itemId || seenIds.has(itemId)) {
              let nextNum = idx + 1;
              itemId = `INQ-2026-${String(nextNum).padStart(3, '0')}`;
              while (seenIds.has(itemId)) {
                nextNum++;
                itemId = `INQ-2026-${String(nextNum).padStart(3, '0')}`;
              }
            }
            seenIds.add(itemId);
            return {
              id: itemId,
              title: item.title || `[${item.serviceType || '견적문의'}] ${item.company || '미지정'} 견적 신청`,
              password: item.password || '1234',
              name: item.name || '신청자',
              company: item.company || '개인/미지정',
              phone: cleanPhone,
              email: item.email || '-',
              serviceType: item.serviceType || '건축물 외벽 고압세척',
              buildingDetails: item.buildingDetails || '상세 내용 작성 문의',
              requestTest: item.requestTest ?? true,
              createdAt: item.createdAt || new Date().toISOString().slice(0, 16).replace('T', ' '),
              status: item.status || '접수완료',
              photos: Array.isArray(item.photos) ? item.photos : [],
              reply: item.reply,
              replyCreatedAt: item.replyCreatedAt,
            };
          });
          safeLocalStorageSet('dronecleanpro_inquiries', JSON.stringify(processed));
          return processed;
        }
      } catch (e) {
        return INITIAL_INQUIRIES;
      }
    }
    return INITIAL_INQUIRIES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedInquiryDetail, setSelectedInquiryDetail] = useState<InquiryItem | null>(null);
  const [previewPhotoModalUrl, setPreviewPhotoModalUrl] = useState<string | null>(null);

  // Helper to generate guaranteed unique inquiry ID
  const generateUniqueId = (existingItems: InquiryItem[]) => {
    const existingIds = new Set(existingItems.map((item) => item.id));
    let maxNum = 0;
    existingItems.forEach((item) => {
      const match = item.id.match(/\d+/g);
      if (match) {
        const num = parseInt(match[match.length - 1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    let nextNum = maxNum + 1;
    let candidate = `INQ-2026-${String(nextNum).padStart(3, '0')}`;
    while (existingIds.has(candidate)) {
      nextNum++;
      candidate = `INQ-2026-${String(nextNum).padStart(3, '0')}`;
    }
    return candidate;
  };

  const handleAddEducationInquiry = (inquiryData: any) => {
    const newId = generateUniqueId(inquiries);
    const createdItem: InquiryItem = {
      id: newId,
      title: inquiryData.title || `[드론 세척 교육] ${inquiryData.name}님 교육 상담 신청`,
      name: inquiryData.name,
      company: inquiryData.company || '교육 상담 신청자',
      phone: inquiryData.phone,
      email: inquiryData.email || '-',
      serviceType: inquiryData.serviceType || '드론 세척 전문교육',
      buildingDetails: inquiryData.buildingDetails || '교육 상담 신청',
      password: inquiryData.password || '1234',
      requestTest: false,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: '접수완료',
      photos: [],
    };

    setInquiries((prev) => {
      const updated = [createdItem, ...prev];
      safeLocalStorageSet('dronecleanpro_inquiries', JSON.stringify(updated));
      return updated;
    });
  };

  // Photo File Handlers
  const handlePhotoUpload = async (
    files: FileList | null,
    targetStateSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (!files) return;
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!isValidMediaFile(file)) {
        alert('이미지 파일(PNG, GIF/JIF, JPG, WEBP 등)만 업로드할 수 있습니다.');
        continue;
      }
      try {
        const compressed = await compressImageFile(file, 1080, 1080, 0.8);
        targetStateSetter((prev) => [...prev, compressed]);
      } catch (e) {
        console.warn('Photo processing failed:', e);
      }
    }
  };

  const removePhoto = (
    index: number,
    targetStateSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    targetStateSetter((prev) => prev.filter((_, i) => i !== index));
  };

  const addInquiryRecord = (data: {
    title?: string;
    password?: string;
    name: string;
    company?: string;
    phone: string;
    email?: string;
    serviceType: string;
    buildingDetails?: string;
    requestTest: boolean;
    photos?: string[];
  }) => {
    const defaultTitle = `[${data.serviceType}] 견적 및 시범 테스트 신청`;

    const newInq: InquiryItem = {
      id: generateUniqueId(inquiries),
      title: data.title && data.title.trim() ? data.title : defaultTitle,
      password: data.password && data.password.trim() ? data.password : '1234',
      name: data.name,
      company: data.company || '개인/미지정',
      phone: data.phone,
      email: data.email || '-',
      serviceType: data.serviceType,
      buildingDetails: data.buildingDetails || '상세 내용 작성 문의',
      requestTest: data.requestTest,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: '접수완료',
      photos: data.photos || [],
    };
    const updated = [newInq, ...inquiries];
    setInquiries(updated);
    safeLocalStorageSet('dronecleanpro_inquiries', JSON.stringify(updated));
    // Auto unlock for current session
    setUnlockedInquiryIds((prev) => [...prev, newInq.id]);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      adminPasswordInput === '0611'
    ) {
      setIsAdminAuthenticated(true);
      safeSessionStorageSet('dronecleanpro_admin_auth', 'true');
      setShowAdminLoginModal(false);
      setQuoteActiveTab('my');
      setAdminPasswordInput('');
      setAdminAuthError('');
      setTimeout(() => {
        document.getElementById('quote-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      setAdminAuthError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    safeSessionStorageRemove('dronecleanpro_admin_auth');
    setAdminToastMessage('관리자 모드가 해제되었습니다.');
    setTimeout(() => setAdminToastMessage(null), 3500);
  };

  const handleQuoteNavClick = (tab: 'new' | 'my' = 'new') => {
    setQuoteActiveTab(tab);
    setTimeout(() => {
      document.getElementById('quote-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleOpenDetailModal = (item: InquiryItem) => {
    setSelectedInquiryDetail(item);
    setDetailPasswordInput('');
    setDetailPasswordError('');
    setAdminReplyText(item.reply || '');
    setAdminStatusSelect(item.status);
  };

  const handleCloseDetailModal = () => {
    if (selectedInquiryDetail) {
      setUnlockedInquiryIds((prev) => prev.filter((id) => id !== selectedInquiryDetail.id));
    }
    setSelectedInquiryDetail(null);
    setDetailPasswordInput('');
    setDetailPasswordError('');
  };

  const handleDeleteInquiry = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDeleteTargetId(id);
  };

  const confirmDeleteInquiry = (id: string | null) => {
    if (!id) return;
    const updated = inquiries.filter((item) => item.id !== id);
    setInquiries(updated);
    safeLocalStorageSet('dronecleanpro_inquiries', JSON.stringify(updated));
    if (selectedInquiryDetail?.id === id) {
      setSelectedInquiryDetail(null);
    }
    setDeleteTargetId(null);
    setAdminToastMessage('문의글이 성공적으로 삭제되었습니다.');
    setTimeout(() => setAdminToastMessage(null), 3500);
  };

  const handleUnlockInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryDetail) return;

    if (
      detailPasswordInput === selectedInquiryDetail.password ||
      detailPasswordInput === '0611'
    ) {
      setUnlockedInquiryIds((prev) => [...prev, selectedInquiryDetail.id]);
      if (
        detailPasswordInput === '0611'
      ) {
        setIsAdminAuthenticated(true);
        safeSessionStorageSet('dronecleanpro_admin_auth', 'true');
      }
      setDetailPasswordInput('');
      setDetailPasswordError('');
    } else {
      setDetailPasswordError('비밀번호가 일치하지 않습니다. (작성 시 설정한 4자리 숫자)');
    }
  };

  const handleSaveAdminReply = () => {
    if (!selectedInquiryDetail) return;
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const updated = inquiries.map((inq) => {
      if (inq.id === selectedInquiryDetail.id) {
        return {
          ...inq,
          status: adminStatusSelect,
          reply: adminReplyText,
          replyCreatedAt: adminReplyText.trim() ? (inq.replyCreatedAt || now) : undefined,
        };
      }
      return inq;
    });
    setInquiries(updated);
    safeLocalStorageSet('dronecleanpro_inquiries', JSON.stringify(updated));
    setSelectedInquiryDetail((prev) =>
      prev
        ? {
            ...prev,
            status: adminStatusSelect,
            reply: adminReplyText,
            replyCreatedAt: adminReplyText.trim() ? (prev.replyCreatedAt || now) : undefined,
          }
        : null
    );
    setAdminToastMessage('답변 및 진행 상태가 성공적으로 저장되었습니다.');
    setTimeout(() => setAdminToastMessage(null), 3500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.title || !formData.password) {
      alert('성함, 연락처, 제목, 비밀번호를 모두 입력해 주세요.');
      return;
    }
    addInquiryRecord({
      title: formData.title,
      password: formData.password,
      name: formData.name,
      company: formData.company,
      phone: formData.phone,
      email: formData.email,
      serviceType: formData.serviceType,
      buildingDetails: formData.buildingDetails,
      requestTest: formData.requestTest,
      photos: formPhotos,
    });
    setIsSubmitted(true);
    setFormPhotos([]);
    setFormData({
      title: '',
      password: '',
      name: '',
      company: '',
      phone: '',
      email: '',
      serviceType: '건물외벽청소',
      buildingDetails: '',
      message: '',
      requestTest: false,
    });
  };

  const openTestModal = (serviceName?: unknown) => {
    if (typeof serviceName === 'string' && serviceName.trim()) {
      setModalServiceType(serviceName.trim());
    }
    setModalPhotos([]);
    setIsModalOpen(true);
  };

  // Filtered Inquiries
  const filteredInquiries = inquiries.filter((item) => {
    const serviceType = item.serviceType || '';
    const matchesCategory =
      selectedCategory === '전체' ||
      serviceType === selectedCategory ||
      serviceType.includes(selectedCategory) ||
      (selectedCategory === '건물외벽청소' && (serviceType.includes('외벽') || serviceType.includes('도장'))) ||
      (selectedCategory === '태양광청소' && serviceType.includes('태양광')) ||
      (selectedCategory === '유리창청소' && serviceType.includes('유리')) ||
      (selectedCategory === '기타/상담 문의' && (!serviceType.includes('외벽') && !serviceType.includes('태양광') && !serviceType.includes('유리')));

    const query = (searchQuery || '').toLowerCase().trim();
    if (!query) return matchesCategory;

    const titleStr = (item.title || '').toLowerCase();
    const nameStr = (item.name || '').toLowerCase();
    const companyStr = (item.company || '').toLowerCase();
    const detailsStr = (item.buildingDetails || '').toLowerCase();
    const idStr = (item.id || '').toLowerCase();
    const phoneStr = (item.phone || '').replace(/[^0-9]/g, '');
    const cleanDigits = query.replace(/[^0-9]/g, '');
    const matchesPhone = cleanDigits.length >= 2 && phoneStr.includes(cleanDigits);

    const matchesSearch =
      titleStr.includes(query) ||
      nameStr.includes(query) ||
      companyStr.includes(query) ||
      detailsStr.includes(query) ||
      idStr.includes(query) ||
      matchesPhone;

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#1d61e8] selection:text-white">
      {currentPage === 'education' ? (
        <EducationPage
          onNavigateHome={navigateToMain}
          onOpenAdminLogin={() => {
            setShowAdminLoginModal(true);
            setAdminAuthError('');
          }}
          isAdminAuthenticated={isAdminAuthenticated}
          onAdminLogout={handleAdminLogout}
          onOpenImageManager={() => handleOpenImageManager()}
          getImage={getImage}
          onAddInquiry={handleAddEducationInquiry}
          showConsultModal={showEduConsultModal}
          setShowConsultModal={setShowEduConsultModal}
        />
      ) : (
        <>
          {/* 1. TOP B2B ANNOUNCEMENT BAR (Executive Corporate Dark Slate Bar, Seamless with Header - No Border) */}
          <div className="bg-slate-900 text-slate-300 text-xs py-2.5 px-4">
            <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2.5 font-medium">
                <span className="px-2 py-1 rounded bg-[#1d61e8] text-white text-[10px] font-bold tracking-wider leading-tight text-center whitespace-pre-line">
{`B2B
시설관리`}
                </span>
                <span className="text-slate-200 font-semibold text-xs sm:text-sm leading-snug">
                  중대재해처벌법 대비 고소작업 최소화ㆍ
                  <br className="sm:hidden" />
                  건물외벽ㆍ태양광ㆍ유리창 세척
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={navigateToEducation}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1d61e8] hover:bg-[#1550c6] text-white font-bold transition-all shadow-xs cursor-pointer text-[11px]"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>드론 세척 교육사업 안내 →</span>
                </button>
                <span className="hidden md:inline text-slate-700">|</span>
                <a
                  href="tel:01085642682"
                  className="hover:text-white flex items-center gap-1.5 font-semibold text-slate-200 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#1d61e8]" />
                  <span>010-8564-2682</span>
                </a>
                <span className="hidden md:inline text-slate-700">|</span>
                <span className="hidden md:inline text-slate-400 font-normal">
                  dcpro25@naver.com
                </span>
              </div>
            </div>
          </div>

      {/* 2. HEADER / NAVIGATION (Crisp White + Clean Corporate Typography) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo (검정 테두리 완전히 삭제된 클린 로고 마크) */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 sm:gap-3.5 group text-left cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-xs aspect-square border-0">
              <img
                src={getImage('logo')}
                alt="드론클린프로 로고"
                className="w-full h-full object-cover aspect-square"
                width={1080}
                height={1080}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = logoIconImg;
                }}
              />
            </div>
            <div>
              <div className="font-black text-lg sm:text-xl tracking-tight text-slate-900">
                드론클린프로
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium tracking-wide leading-tight">
                B2B 스마트 외벽
                <br />
                ㆍ태양광ㆍ유리창 세척
              </p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-[#1d61e8] transition-colors py-1 cursor-pointer"
            >
              사업 영역
            </button>
            <button
              onClick={() => document.getElementById('technology')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-[#1d61e8] transition-colors py-1 cursor-pointer"
            >
              기술 소개
            </button>
            <button
              onClick={() => document.getElementById('eco-safety')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-[#1d61e8] transition-colors py-1 cursor-pointer"
            >
              세척 방식
            </button>
            <button
              onClick={() => document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-[#1d61e8] transition-colors py-1 cursor-pointer"
            >
              서비스 비교
            </button>
            <button
              onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-[#1d61e8] transition-colors py-1 cursor-pointer"
            >
              진행안내
            </button>

            {/* 1. 네비게이션 메뉴명: 견적문의 */}
            <button
              onClick={() => handleQuoteNavClick()}
              className="hover:text-[#1d61e8] transition-colors py-1 text-slate-700 cursor-pointer"
            >
              견적문의
            </button>

            {/* 교육사업 메뉴 링크 (강조 스타일) */}
            <button
              onClick={navigateToEducation}
              className="text-[#1d61e8] hover:text-[#1550c6] font-black text-sm px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <span>교육사업</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d61e8]" />
            </button>
          </nav>

          {/* Actions: 관리자 로그인, 문의하기, 모바일 햄버거 메뉴 토글 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 관리자 로그인 버튼 */}
            {isAdminAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenImageManager()}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded border border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="게시 사진/동영상 관리자"
                >
                  <Camera className="w-3.5 h-3.5 text-[#1d61e8]" />
                  <span className="hidden sm:inline">사진 관리</span>
                  <span className="sm:hidden">사진</span>
                </button>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded border border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer"
                  title="관리자 로그아웃"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowAdminLoginModal(true);
                  setAdminAuthError(null);
                }}
                className="hidden sm:flex px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded border border-slate-300 hover:border-slate-900 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-[11px] sm:text-xs font-medium items-center gap-1.5 transition-colors shadow-xs cursor-pointer text-left leading-tight"
                title="관리자 로그인"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="leading-tight">
                  관리자
                  <br />
                  로그인
                </span>
              </button>
            )}

            {/* 문의하기 (Primary CTA Button) */}
            <button
              type="button"
              onClick={() => handleQuoteNavClick('new')}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#1d61e8] hover:bg-[#1550c6] text-white font-bold px-3 sm:px-4 py-2 rounded shadow-xs hover:shadow transition-all text-xs sm:text-sm cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>문의하기</span>
            </button>

            {/* 모바일 햄버거 메뉴 토글 버튼 */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 모바일 내비게이션 드로어 (화면 크기에 맞춘 모바일 전용 메뉴) */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-xl animate-fadeIn">
            <nav className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
              <button
                onClick={() => {
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>사업 영역 (외벽ㆍ태양광ㆍ유리창)</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('technology')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>기술 소개 (특허 전용노즐)</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('eco-safety')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>세척 방식 (순수정제수 & 친환경)</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>서비스 비교 (기존 방식 vs 드론클린프로)</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>진행안내</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  handleQuoteNavClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between text-[#1d61e8] font-bold"
              >
                <span>견적문의 / 조회</span>
                <ChevronRight className="w-4 h-4 text-[#1d61e8]" />
              </button>
              
              {/* 드론 세척 교육사업 링크 (모바일 강조) */}
              <button
                onClick={() => {
                  navigateToEducation();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-3 px-3.5 rounded-xl bg-blue-50 text-[#1d61e8] border border-blue-200 font-black transition-all cursor-pointer flex items-center justify-between shadow-xs mt-1"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#1d61e8]" />
                  <span>드론 세척 전문 교육사업</span>
                </span>
                <span className="text-[10px] bg-[#1d61e8] text-white px-2 py-0.5 rounded-full font-bold">신규</span>
              </button>
            </nav>

            {/* 모바일 하단 빠른 액션 바 */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <a
                href="tel:01085642682"
                className="flex-1 py-2.5 px-3 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>010-8564-2682</span>
              </a>
              {isAdminAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenImageManager();
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5 text-[#1d61e8]" />
                  <span>사진관리</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>관리자</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main>
        {/* 3. HERO SECTION (Enterprise Corporate Layout: Clean Whitespace, Solid Typography, Photo-Centric) */}
        <section className="relative py-16 lg:py-24 bg-white text-slate-900 border-b border-slate-200">
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Top Row: Left Content + Right Visual Image Card */}
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                
                {/* Eyebrow Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 text-[11px] sm:text-xs md:text-sm font-bold shadow-xs">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1d61e8]" />
                    <span>건물위생관리업 정식 인허가 업체</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 text-[11px] sm:text-xs md:text-sm font-bold shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                    <span>드론배상책임보험 가입 업체</span>
                  </div>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.2] tracking-tight break-keep">
                  사람 대신 기술로,
                  <br />
                  <span className="text-[#1d61e8]">
                    중대재해 리스크를
                    <br />
                    낮추는
                  </span>
                  <br />
                  스마트 시설 관리
                </h1>

                {/* Sub Headline */}
                <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed break-keep">
                  건물외벽, 태양광 발전 패널, 유리창까지 산업용 드론과 전문 세척 기술을 활용해 안전하고 체계적으로 세척합니다. 현장 특성에 맞는 작업 방식으로 효율적인 청소 서비스를 제공합니다.
                </p>

                {/* Action Buttons (Solid Dark CTA + Royal Blue CTA) */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                  <button
                    onClick={() => openTestModal('문의하기')}
                    className="w-full sm:w-auto px-5 sm:px-8 py-3.5 sm:py-4 rounded bg-slate-900 hover:bg-black text-white font-extrabold text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span>견적 및 현장 상담 문의</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-white" />
                  </button>

                  <a
                    href="tel:01085642682"
                    className="w-full sm:w-auto px-5 sm:px-8 py-3.5 sm:py-4 rounded bg-[#1d61e8] hover:bg-[#1550c6] text-white font-black text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                    <span>010-8564-2682</span>
                  </a>
                </div>

              </div>

              {/* Right Visual Image Card (Photo-Centric Display) */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white p-2 h-[280px] xs:h-[320px] sm:h-[380px] lg:h-[440px] group">
                  {/* Image 1 */}
                  <div className={`absolute inset-2 transition-opacity duration-700 ease-in-out ${currentHeroIndex === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <EditableSiteImage
                      imageKey="hero_main"
                      alt="드론클린프로 외벽 고압세척 현장 1"
                      className="w-full h-full object-cover object-center rounded-xl"
                      containerClassName="w-full h-full rounded-xl overflow-hidden"
                    />
                  </div>

                  {/* Image 2 */}
                  <div className={`absolute inset-2 transition-opacity duration-700 ease-in-out ${currentHeroIndex === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <EditableSiteImage
                      imageKey="hero_main_2"
                      alt="드론클린프로 외벽 고압세척 현장 2"
                      className="w-full h-full object-cover object-center rounded-xl"
                      containerClassName="w-full h-full rounded-xl overflow-hidden"
                    />
                  </div>

                  {/* Bottom Indicator Dots */}
                  <div className="absolute bottom-5 right-5 z-20 flex items-center bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCurrentHeroIndex(0)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          currentHeroIndex === 0 ? 'w-5 bg-[#1d61e8]' : 'w-2 bg-white/50 hover:bg-white/90'
                        }`}
                        title="첫 번째 이미지"
                      />
                      <button
                        type="button"
                        onClick={() => setCurrentHeroIndex(1)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          currentHeroIndex === 1 ? 'w-5 bg-[#1d61e8]' : 'w-2 bg-white/90'
                        }`}
                        title="두 번째 이미지"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row: 3 Highlights Cards (Expanded Full-Width Container so Sentences Stay on Single Lines per Line Break) */}
            <div className="mt-10 pt-8 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                {/* 경제성 */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-xs transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#1d61e8] shrink-0 font-bold shadow-xs">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      경제성
                    </h3>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal break-keep">
                    인력 중심 작업 대비 효율적인 비용 구조를 제공하며, 현장 조건에 맞춘 작업으로 불필요한 비용을 줄입니다.
                  </p>
                </div>

                {/* 효율성 */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-xs transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#1d61e8] shrink-0 font-bold shadow-xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      효율성
                    </h3>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal break-keep">
                    대규모 시설도 체계적이고 신속하게 드론과 전문 세척 장비로 작업 효율을 높입니다.
                  </p>
                </div>

                {/* 안전성 */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-xs transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#1d61e8] shrink-0 font-bold shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      안전성
                    </h3>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal break-keep">
                    고소작업에 따른 추락 위험을 최소화하며, 지상에서 안전하게 작업을 운용 및 통제합니다.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

      {/* 4. KEY APPLICABLE SERVICES (Corporate Layout: Black/White/Slate with Single Royal Blue Accent) */}
      <section id="services" className="py-24 lg:py-32 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white border border-slate-200 text-[#1d61e8] text-xs font-bold uppercase tracking-wider shadow-xs">
              KEY APPLICABLE AREAS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              다양한 현장에 최적화된 <br />
              <span className="text-[#1d61e8]">
                드론 고압 세척 사업 영역
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
{`아파트, 대형 오피스, 물류센터, 태양광 발전 설비부터 재도장 전처리까지
안전하고 정밀한 맞춤 세척을 제공합니다.`}
            </p>
          </div>

          {/* 4 Cards Grid - 1 Row 4 Columns on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Service 1: 건축물 외벽 */}
            <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-800 p-5 space-y-4 flex flex-col justify-between shadow-xs hover:shadow transition-all group">
              <div className="space-y-4">
                <EditableSiteImage
                  imageKey="service_01"
                  alt="건축물 외벽 세척"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  containerClassName="relative h-44 w-full rounded overflow-hidden border border-slate-200"
                />

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1d61e8] transition-colors">
                    01. 건축물 외벽 세척
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    아파트 · 오피스 · 물류센터 · 공장 외벽
                  </p>
                </div>
              </div>

              <button
                onClick={() => openTestModal('건축물 외벽 세척')}
                className="w-full mt-2 py-2.5 rounded bg-slate-100 hover:bg-[#1d61e8] hover:text-white text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>견적 및 테스트 신청</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 2: 태양광 패널 */}
            <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-800 p-5 space-y-4 flex flex-col justify-between shadow-xs hover:shadow transition-all group">
              <div className="space-y-4">
                <EditableSiteImage
                  imageKey="service_02"
                  alt="태양광 패널 세척"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  containerClassName="relative h-44 w-full rounded overflow-hidden border border-slate-200"
                />

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1d61e8] transition-colors">
                    02. 태양광 패널 세척
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    지붕형 태양광 · 태양광 발전소 · 공장 지붕
                  </p>
                </div>
              </div>

              <button
                onClick={() => openTestModal('태양광 패널 세척')}
                className="w-full mt-2 py-2.5 rounded bg-slate-100 hover:bg-[#1d61e8] hover:text-white text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>견적 및 테스트 신청</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 3: 유리창 세척 */}
            <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-800 p-5 space-y-4 flex flex-col justify-between shadow-xs hover:shadow transition-all group">
              <div className="space-y-4">
                <EditableSiteImage
                  imageKey="service_03"
                  alt="유리창 세척"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  containerClassName="relative h-44 w-full rounded overflow-hidden border border-slate-200"
                />

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1d61e8] transition-colors">
                    03. 유리창 세척
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    빌딩 커튼월 · 주상복합 · 대형 매장 유리창
                  </p>
                </div>
              </div>

              <button
                onClick={() => openTestModal('유리창 세척')}
                className="w-full mt-2 py-2.5 rounded bg-slate-100 hover:bg-[#1d61e8] hover:text-white text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>견적 및 테스트 신청</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Service 4: 재도장 전 세척 */}
            <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-800 p-5 space-y-4 flex flex-col justify-between shadow-xs hover:shadow transition-all group">
              <div className="space-y-4">
                <EditableSiteImage
                  imageKey="service_04"
                  alt="재도장 전 고압세척"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  containerClassName="relative h-44 w-full rounded overflow-hidden border border-slate-200"
                />

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1d61e8] transition-colors">
                    04. 재도장 전 고압세척
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    아파트 재도장 공사 · 빌딩 전체 외벽 세척
                  </p>
                </div>
              </div>

              <button
                onClick={() => openTestModal('재도장 전 고압세척')}
                className="w-full mt-2 py-2.5 rounded bg-slate-100 hover:bg-[#1d61e8] hover:text-white text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>견적 및 테스트 신청</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Interactive Before/After Showcase (Photo-Centric Field Evidence) */}
          <div className="mt-16 lg:mt-24 bg-white p-8 sm:p-10 rounded-xl border border-slate-200 shadow-xs space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="space-y-2 max-w-3xl">
                <span className="text-xs font-bold text-[#1d61e8] uppercase tracking-wider">REAL PROJECTS</span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">실제 시공 현장 세척 전ㆍ후</h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
{`인력 접근이 어려운 건물외벽과 태양광 패널을 
드론 고압 세척으로 안전하고 정밀하게 세척합니다.`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 shrink-0">
                <a
                  href="https://www.youtube.com/@%EB%93%9C%EB%A1%A0%ED%81%B4%EB%A6%B0%ED%94%84%EB%A1%9C/shorts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
                >
                  <Youtube className="w-4 h-4 text-red-500" />
                  <span>유튜브 시공영상</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
                <a
                  href="https://blog.naver.com/PostList.naver?blogId=dronecleanpro&from=postList&categoryNo=9&parentCategoryNo=9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs sm:text-sm font-semibold transition-all shadow-xs"
                >
                  <span>네이버 블로그 시공사례</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>

            {/* 2 Field Application Showcase Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Card 1: 건물 외벽 세척 */}
              <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
                  <span className="flex items-center gap-2 text-slate-900 font-bold">
                    <Building2 className="w-4 h-4 text-[#1d61e8]" />
                    건물 외벽 고압 세척 현장
                  </span>
                  <span className="text-[11px] text-slate-500">실제 시공 사진</span>
                </div>

                <div className="relative rounded overflow-hidden border border-slate-300 shadow-xs group bg-white">
                  {/* Top Center Badge: 세척 전 */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs font-bold px-3 py-1 rounded shadow-md border border-white/20 z-10 pointer-events-none tracking-wide">
                    세척 전 (Before)
                  </div>

                  <EditableSiteImage
                    imageKey="modal_building"
                    alt="건물 외벽 세척 현장"
                    className="w-full h-72 sm:h-80 lg:h-[340px] object-cover"
                    containerClassName="w-full rounded overflow-hidden"
                  />

                  {/* Bottom Center Badge: 세척 후 */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#1d61e8] text-white text-xs font-bold px-3 py-1 rounded shadow-md border border-white/20 z-10 pointer-events-none tracking-wide">
                    세척 후 (After)
                  </div>
                </div>
              </div>

              {/* Card 2: 태양광 패널 세척 */}
              <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 pb-2 border-b border-slate-200">
                  <span className="flex items-center gap-2 text-slate-900 font-bold">
                    <Sun className="w-4 h-4 text-[#1d61e8]" />
                    태양광 패널 세척 현장
                  </span>
                  <span className="text-[11px] text-slate-500">실제 시공 사진</span>
                </div>

                <div className="relative rounded overflow-hidden border border-slate-300 shadow-xs group bg-white">
                  {/* Top Center Badge: 세척 전 */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs font-bold px-3 py-1 rounded shadow-md border border-white/20 z-10 pointer-events-none tracking-wide">
                    세척 전 (Before)
                  </div>

                  <EditableSiteImage
                    imageKey="modal_solar"
                    alt="태양광 패널 세척 현장"
                    className="w-full h-72 sm:h-80 lg:h-[340px] object-cover"
                    containerClassName="w-full rounded overflow-hidden"
                  />

                  {/* Bottom Center Badge: 세척 후 */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#1d61e8] text-white text-xs font-bold px-3 py-1 rounded shadow-md border border-white/20 z-10 pointer-events-none tracking-wide">
                    세척 후 (After)
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. OUR CORE TECHNOLOGIES (Corporate Layout: Clean Whitespace, Black/White/Slate Architecture) */}
      <section id="technology" className="py-24 lg:py-32 bg-white text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 border border-slate-200 text-[#1d61e8] text-xs font-bold uppercase tracking-wider">
              PATENT-BASED TECHNOLOGY
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              더 안전하게, 더 정밀하게_ <br />
              <span className="text-[#1d61e8]">
                현장을 바꾸는 <br />
                드론클린프로 4대 기술
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
{`원천 특허 기반 기술과 산업용 고유량 세척기술로
대형 시설물 작업의 안전성과 세척 완성도를 높입니다.`}
            </p>
          </div>

          {/* Horizontal Stacked Layout for Core Technologies */}
          <div className="space-y-8">
            
            {/* Tech 1 Row: 드론 전용 특수 노즐 */}
            <div className="bg-slate-50 p-6 sm:p-10 rounded-xl border border-slate-200 hover:border-slate-400 transition-all shadow-xs">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded bg-blue-50 text-[#1d61e8] border border-blue-200 text-xs font-bold tracking-wider">
                      드론클린프로 자체개발
                    </span>
                    <span className="px-3 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold tracking-wider">
                      특허진행중
                    </span>
                    <span className="px-3 py-1 rounded bg-slate-200/80 text-slate-800 border border-slate-300 text-xs font-semibold">
                      국내유일 드론전용 노즐
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-start sm:items-center gap-3">
                      <span className="w-10 h-10 rounded bg-slate-900 text-white flex items-center justify-center text-base font-bold shrink-0 mt-0.5 sm:mt-0">
                        01
                      </span>
                      <span>국내 유일 자체 개발 드론 전용 특수 노즐</span>
                    </h3>
                  </div>

                  {/* 소제목 / 핵심문구 */}
                  <div className="p-4 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold text-sm sm:text-base flex items-center gap-3 shadow-xs">
                    <Droplets className="w-5 h-5 text-[#1d61e8] shrink-0" />
                    <span>브러쉬 접촉 없이 고착 오염까지 제거하는 비접촉 세척 기술</span>
                  </div>

                  {/* 기술세부사항 */}
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700 bg-white p-5 rounded-lg border border-slate-200 w-full">
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#1d61e8]" />
                      기술 세부사항
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#1d61e8] font-bold">ㆍ</span>
                      <div>
                        <strong className="text-slate-900 font-semibold">자체 개발 특수 노즐 :</strong> 드론 세척 환경에 최적화된 자체 개발·제작 노즐 시스템 적용
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#1d61e8] font-bold">ㆍ</span>
                      <div>
                        <strong className="text-slate-900 font-semibold">비접촉 세척 방식 :</strong> 브러쉬 등 물리적 마찰 없이 수압과 표면장력을 활용해 오염물 제거
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#1d61e8] font-bold">ㆍ</span>
                      <div>
                        <strong className="text-slate-900 font-semibold">고착 오염 제거 기술 :</strong> 일반적인 물 분사만으로 제거하기 어려운 찌든 오염까지 효과적으로 세척
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#1d61e8] font-bold">ㆍ</span>
                      <div>
                        <strong className="text-slate-900 font-semibold">360° 회전 분사 구조 :</strong> 회전형 분사 방식으로 넓은 세척 범위를 확보하고 효율적인 작업 수행
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Image */}
                <div className="lg:col-span-4 xl:col-span-3 flex justify-center items-center">
                  <div className="max-w-[240px] w-full rounded-lg overflow-hidden border border-slate-300 bg-white p-2.5 shadow-xs relative group">
                    <EditableSiteImage
                      imageKey="tech_nozzle"
                      alt="드론 전용 특수 노즐"
                      className="w-full h-full object-cover"
                      containerClassName="aspect-[3/4] w-full rounded overflow-hidden relative border border-slate-200"
                    />
                    <div className="mt-2.5 py-1.5 px-2 bg-slate-50 rounded text-center border border-slate-200">
                      <p className="text-[11px] text-slate-700 font-bold">드론 전용 특수 노즐</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech 2 Row: 수직 하향 계류식 특허 기반 기술 */}
            <div className="bg-slate-50 p-6 sm:p-10 rounded-xl border border-slate-200 hover:border-slate-400 transition-all shadow-xs">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded bg-blue-50 text-[#1d61e8] border border-blue-200 text-xs font-bold uppercase tracking-wider">
                      에어퓨처 원천 특허
                    </span>
                    <span className="px-3 py-1 rounded bg-slate-200/80 text-slate-800 border border-slate-300 text-xs font-semibold">
                      추락 방지 안전 메커니즘
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
                      <span className="w-10 h-10 rounded bg-slate-900 text-white flex items-center justify-center text-base font-bold shrink-0">
                        02
                      </span>
                      <span>수직 하향 계류식 특허 기반 기술</span>
                    </h3>
                  </div>

                  {/* 핵심문구 */}
                  <div className="p-4 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold text-sm sm:text-base flex items-center gap-3 shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-[#1d61e8] shrink-0" />
                    <span>기체 고장이나 전원 차단 시에도 추락을 방지하는 안전 메커니즘</span>
                  </div>

                  {/* 핵심내용 */}
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700 bg-white p-5 rounded-lg border border-slate-200 w-full">
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#1d61e8]" />
                      기술 세부사항
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#1d61e8] font-bold">ㆍ</span>
                      <div>
                        <strong className="text-slate-900 font-semibold">원천 특허 :</strong> 드론 전문기업 '에어퓨쳐'의 특허 기반 세척 시스템 적용
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#1d61e8] font-bold">ㆍ</span>
                      <div>
                        <strong className="text-slate-900 font-semibold">추락 방지 계류 구조 :</strong> 옥상 지상장비와 고강도 케이블로 연결해 물리적 이탈과 추락을 방지
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#1d61e8] font-bold">ㆍ</span>
                      <div>
                        <strong className="text-slate-900 font-semibold">비상시 자동 고정 :</strong> 비행 중 기체 결함이나 전원 차단 시에도 공중에서 안정적으로 고정
                      </div>
                    </div>
                  </div>

                  {/* 참고사항 */}
                  <div className="p-4 rounded-lg bg-slate-200/50 border border-slate-300 text-xs sm:text-sm space-y-1 w-full">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-300 text-slate-900 text-[10px] font-bold">운용 원칙</span>
                      <span>현장 맞춤형 유연한 운용</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                      건물 구조와 현장 환경에 따라 <strong className="text-slate-900 font-bold">'수직 하향 계류식'</strong>과 <strong className="text-slate-900 font-bold">'지상 상승 계류식'</strong> 중 적합한 방식을 선택해 적용합니다.
                    </p>
                  </div>
                </div>

                {/* Right Image */}
                <div className="lg:col-span-4 xl:col-span-3 flex justify-center items-center">
                  <div className="max-w-[240px] w-full rounded-lg overflow-hidden border border-slate-300 bg-white p-2.5 shadow-xs relative group">
                    <EditableSiteImage
                      imageKey="tech_tethered"
                      alt="수직하향계류식 구조 다이어그램"
                      className="w-full h-full object-cover"
                      containerClassName="aspect-[3/4] w-full rounded overflow-hidden relative border border-slate-200"
                    />
                    <div className="mt-2.5 py-1.5 px-2 bg-slate-50 rounded text-center border border-slate-200">
                      <p className="text-[11px] text-slate-700 font-bold">수직하향계류 시스템</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech 3 Row: 고유량 / 고압수 시스템 */}
            <div className="bg-slate-50 p-6 sm:p-10 rounded-xl border border-slate-200 hover:border-slate-400 transition-all shadow-xs">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded bg-blue-50 text-[#1d61e8] border border-blue-200 text-xs font-bold uppercase tracking-wider">
                      산업용 250 bar 시스템
                    </span>
                    <span className="px-3 py-1 rounded bg-slate-200/80 text-slate-800 border border-slate-300 text-xs font-semibold">
                      초고압 & 고유량 세척
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-start gap-3 leading-tight">
                      <span className="w-10 h-10 rounded bg-slate-900 text-white flex items-center justify-center text-base font-bold shrink-0 mt-0.5">
                        03
                      </span>
                      <span className="whitespace-pre-line">
{`250 bar 초고압 
& 30~60 L/min 고유량 시스템`}
                      </span>
                    </h3>
                  </div>

                  {/* 핵심문구 */}
                  <div className="p-4 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold text-sm sm:text-base flex items-center gap-3 shadow-xs">
                    <Zap className="w-5 h-5 text-[#1d61e8] shrink-0" />
                    <span>높은 압력과 충분한 유량으로 강력한 세척력을 구현</span>
                  </div>

                  {/* 핵심내용 */}
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700 bg-white p-5 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#1d61e8]" />
                      기술 세부사항
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#1d61e8] font-bold">ㆍ</span>
                      <div>
                        <strong className="text-slate-900 font-semibold">고압·고유량 세척 : </strong>
                        일반 세차장(100 bar / 10 L/min) 대비 높은 압력과 유량으로 묵은 때와 복합 오염을 효과적으로 제거합니다.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#1d61e8] font-bold">ㆍ</span>
                      <div>
                        <strong className="text-slate-900 font-semibold">세척 환경 최적화 : </strong>
                        드론과 세척면 사이의 이격 거리를 고려해 고유량 펌프로 세척 성능을 확보합니다.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#1d61e8] font-bold">ㆍ</span>
                      <div>
                        <strong className="text-slate-900 font-semibold">고유량 세척 성능 : </strong>
                        30~60 L/min의 충분한 유량으로 오염 물질과 세제 잔여물을 효과적으로 제거합니다.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Spec Comparison Box */}
                <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-300 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#1d61e8]" />
                      고압세척기 스펙 비교
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">일반 장비 vs 드론클린프로</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {/* Left: 일반 장비 */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <EditableSiteImage
                          imageKey="tech_carwash"
                          alt="일반 세차장 고압세척기"
                          className="w-full h-full object-cover filter grayscale contrast-120"
                          containerClassName="relative h-28 w-full rounded overflow-hidden border border-slate-200"
                        />
                        <div className="text-xs font-bold text-slate-500 border-b border-slate-200 pb-1">
                          일반 고압세척 장비
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1 text-[11px]">
                        <div>
                          <div className="text-[10px] text-slate-400">분사 압력</div>
                          <div className="font-semibold text-slate-600">100 bar</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">토출 유량</div>
                          <div className="font-semibold text-slate-600">10 L/min</div>
                        </div>
                      </div>
                    </div>

                    {/* Right: 드론클린프로 */}
                    <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-200 text-center space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <EditableSiteImage
                          imageKey="tech_carwash_sub"
                          alt="드론클린프로 고압세척 현장"
                          className="w-full h-full object-cover"
                          containerClassName="relative h-28 w-full rounded overflow-hidden border border-blue-300"
                        />
                        <div className="text-xs font-bold text-[#1d61e8] border-b border-blue-200 pb-1">
                          드론클린프로
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1 text-[11px]">
                        <div>
                          <div className="text-[10px] text-slate-600">분사 압력</div>
                          <div className="font-extrabold text-[#1d61e8] text-xs">250 bar (초고압)</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-600">토출 유량</div>
                          <div className="font-extrabold text-[#1d61e8] text-xs">30 ~ 60 L/min (고유량)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech 4 Row: 퓨어워터 (Pure Water) */}
            <div className="bg-slate-50 p-6 sm:p-10 rounded-xl border border-slate-200 hover:border-slate-400 transition-all shadow-xs">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded bg-blue-50 text-[#1d61e8] border border-blue-200 text-xs font-bold uppercase tracking-wider">
                      물자국·얼룩 저감
                    </span>
                    <span className="px-3 py-1 rounded bg-slate-200/80 text-slate-800 border border-slate-300 text-xs font-semibold">
                      초순수 정제 필터 시스템
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
                      <span className="w-10 h-10 rounded bg-slate-900 text-white flex items-center justify-center text-base font-bold shrink-0">
                        04
                      </span>
                      <span>퓨어워터(Pure Water) 정제 시스템</span>
                    </h3>
                  </div>

                  {/* 핵심문구 */}
                  <div className="p-4 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold text-sm sm:text-base flex items-center gap-3 shadow-xs">
                    <Sparkles className="w-5 h-5 text-[#1d61e8] shrink-0" />
                    <span>고순도 정제수 마감으로 물자국을 줄이고 깨끗한 표면을 유지</span>
                  </div>

                  {/* 핵심내용 */}
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700 bg-white p-5 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#1d61e8]" />
                      기술 세부사항
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#1d61e8] font-bold">ㆍ</span>
                      <div>
                        <strong className="text-slate-900 font-semibold">고순도 정제수 사용 : </strong>
                        칼슘·마그네슘 등 물속 미네랄을 제거한 퓨어워터를 사용합니다.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#1d61e8] font-bold">ㆍ</span>
                      <div>
                        <strong className="text-slate-900 font-semibold">물자국 및 잔여물 저감 : </strong>
                        건조 후 미네랄 잔여물을 줄여 유리창의 깨끗한 표면을 유지합니다.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#1d61e8] font-bold">ㆍ</span>
                      <div>
                        <strong className="text-slate-900 font-semibold">유리창 최적화 : </strong>
                        별도 스퀴지 작업을 줄이고 자연 건조 방식으로 깨끗한 마감이 가능합니다.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Visual Image */}
                <div className="lg:col-span-5 flex justify-center items-center">
                  <div className="w-full rounded-lg overflow-hidden border border-slate-300 bg-white p-2.5 shadow-xs">
                    <EditableSiteImage
                      imageKey="tech_purewater"
                      alt="퓨어워터 세척 현장"
                      className="w-full h-full object-cover"
                      containerClassName="relative h-64 sm:h-80 lg:h-[340px] w-full rounded overflow-hidden border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. ECO-FRIENDLY & CHEMICAL SAFETY (Corporate Layout: Clean Whitespace, Black/White/Slate) */}
      <section id="eco-safety" className="py-24 lg:py-32 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white text-[#1d61e8] text-xs font-bold uppercase tracking-wider border border-slate-200 shadow-xs">
              ECO-FRIENDLY CLEANING
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              시설물 자재를 보호하는 <br className="sm:hidden" />
              친환경 세척<br />
              <span className="text-[#1d61e8]">
                생분해성 특수세제 <br className="sm:hidden" />
                & 중성 배출수 관리
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
{`건물 자재 보호와 환경 영향을 고려한 
드론클린프로의 친환경 세척 솔루션`}
            </p>
          </div>

          {/* 2 Core Feature Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Card 1: 생분해성 특수 세제 사용 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between hover:border-slate-400 transition-all">
              <div className="space-y-5">
                <div className="w-11 h-11 rounded bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    생분해성 특수 세제 사용
                  </h3>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed pt-3 border-t border-slate-100">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-1">
                      <span className="text-[#1d61e8]">ㆍ</span>
                      <span>자재 보호</span>
                    </div>
                    <p className="pl-3.5 text-slate-600">
                      약산성(pH 5.4 기준) 특수 세제를 사용해 다양한 마감재에 대한 세척 부담을 줄입니다.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-1">
                      <span className="text-[#1d61e8]">ㆍ</span>
                      <span>높은 생분해성</span>
                    </div>
                    <p className="pl-3.5 text-slate-600">
                      생분해성 특수 세제를 사용해 세척 과정에서 발생하는 환경 부담을 줄입니다.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-1">
                      <span className="text-[#1d61e8]">ㆍ</span>
                      <span>작업 환경 고려</span>
                    </div>
                    <p className="pl-3.5 text-slate-600">
                      작업자와 건물 이용객을 고려한 세척 환경을 구축합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span>세제 pH</span>
                <span className="px-3 py-1 rounded bg-slate-900 text-white font-bold text-xs">pH 5.4 (약산성)</span>
              </div>
            </div>

            {/* Card 2: 중성 배출수 관리 */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between hover:border-slate-400 transition-all">
              <div className="space-y-5">
                <div className="w-11 h-11 rounded bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5 text-white" />
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    중성 배출수 관리
                  </h3>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed pt-3 border-t border-slate-100">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-1">
                      <span className="text-[#1d61e8]">ㆍ</span>
                      <span>중성 전환</span>
                    </div>
                    <p className="pl-3.5 text-slate-600">
                      정제수 수세 및 희석 과정을 통해 최종 배출수의 pH를 중성 수준으로 관리합니다.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-1">
                      <span className="text-[#1d61e8]">ㆍ</span>
                      <span>배출수 관리 기준 준수</span>
                    </div>
                    <p className="pl-3.5 text-slate-600">
                      현장 여건과 관련 기준을 고려해 배출수를 관리합니다.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-1">
                      <span className="text-[#1d61e8]">ㆍ</span>
                      <span>수질 조정 및 시설 보호</span>
                    </div>
                    <p className="pl-3.5 text-slate-600">
                      세척 후 발생하는 배출수가 주변 수계, 수목 및 하부 시설물에 미치는 영향을 줄일 수 있도록 관리합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between">
                <span className="text-slate-600">최종 배출수 pH</span>
                <span className="px-3 py-1 rounded bg-[#1d61e8] text-white font-bold text-xs">pH 7.0 (중성)</span>
              </div>
            </div>

          </div>

          {/* ESG & MSDS Compliance Badge */}
          <div className="mt-10 max-w-5xl mx-auto p-4 sm:p-5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm flex flex-wrap items-center justify-center gap-2 text-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#1d61e8] shrink-0" />
            <span>사용하는 모든 세제의 <strong>MSDS(물질안전보건자료)를 관리</strong>하며, 현장 안전관리 기준에 맞춰 세척 작업을 진행합니다.</span>
          </div>

        </div>
      </section>

      {/* 7. COMPARISON SECTION (Clean Corporate B2B Table) */}
      <section id="comparison" className="py-24 lg:py-32 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 text-[#1d61e8] text-xs font-bold uppercase tracking-wider border border-slate-200">
              B2B COST & SAFETY COMPARISON
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              왜 드론클린프로인가? <br />
              <span className="text-[#1d61e8]">
                기존 세척 방식 <br className="sm:hidden" />
                VS 드론클린프로 비교
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
{`직압 안전성, 인력투입, 작업효율,
현장비용을 기준으로 
기존 세척 방식과 드론클린프로를 비교해 보세요.`}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="sm:hidden flex items-center justify-between bg-blue-50/80 border-b border-blue-100 px-3.5 py-2 text-[11px] text-blue-900 font-bold">
              <span className="flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#1d61e8]" />
                표를 좌우로 스크롤하여 비교 항목을 확인하세요
              </span>
              <span className="text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">← 슬라이드 →</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px] sm:min-w-[700px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs sm:text-sm">
                    <th className="py-4 px-4 font-bold w-[14%] text-center border-r border-slate-800">구분</th>
                    <th className="py-4 px-6 font-bold w-[28%] text-slate-300 border-r border-slate-800">기존 세척 방식</th>
                    <th className="py-4 px-6 font-bold w-[31%] bg-[#1d61e8] text-white border-r border-blue-600">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-white" />
                        드론클린프로 드론 세척
                      </span>
                    </th>
                    <th className="py-4 px-6 font-bold w-[27%] bg-slate-800 text-slate-200">개선 효과</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {/* Row 1: 작업 안전 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900 bg-slate-50 text-center border-r border-slate-200">
                      작업 안전
                    </td>
                    <td className="py-4 px-6 text-slate-600 border-r border-slate-200">
                      <div>고소·지붕 작업 인력 투입</div>
                      <div className="text-xs text-slate-400 mt-0.5">(현장 조건에 따라 안전관리 필요)</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 bg-blue-50/40 border-r border-slate-200">
                      <div>지상 중심의 원격 세척 작업</div>
                      <div className="text-xs text-[#1d61e8] font-semibold mt-0.5">(고소·지붕 작업 인력 투입 최소화)</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 bg-slate-50/50">
                      고소작업 및 추락 위험 최소화
                    </td>
                  </tr>

                  {/* Row 2: 인력 투입 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900 bg-slate-50 text-center border-r border-slate-200">
                      인력 투입
                    </td>
                    <td className="py-4 px-6 text-slate-600 border-r border-slate-200">
                      <div>현장 규모에 따라 다수 인력 투입</div>
                      <div className="text-xs text-slate-400 mt-0.5">(작업범위에 따른 인력ㆍ시간 증가)</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 bg-blue-50/40 border-r border-slate-200">
                      <div>드론 중심의 효율적인 작업 운영</div>
                      <div className="text-xs text-[#1d61e8] font-semibold mt-0.5">(현장 조건에 따라 투입 인력 최적화)</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 bg-slate-50/50">
                      인력 투입 및 작업 비용 절감
                    </td>
                  </tr>

                  {/* Row 3: 작업 효율 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900 bg-slate-50 text-center border-r border-slate-200">
                      작업 효율
                    </td>
                    <td className="py-4 px-6 text-slate-600 border-r border-slate-200">
                      <div>수작업 중심으로 작업 시간 증가</div>
                      <div className="text-xs text-slate-400 mt-0.5">(대규모 현장 작업시 시간 소요)</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 bg-blue-50/40 border-r border-slate-200">
                      <div>대면적 구간을 효율적으로 세척</div>
                      <div className="text-xs text-[#1d61e8] font-semibold mt-0.5">(현장 조건에 따라 작업 시간 단축)</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 bg-slate-50/50">
                      대면적 작업 효율 향상
                    </td>
                  </tr>

                  {/* Row 4: 현장 적용성 */}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900 bg-slate-50 text-center border-r border-slate-200">
                      현장 적용성
                    </td>
                    <td className="py-4 px-6 text-slate-600 border-r border-slate-200">
                      <div>작업 장비 및 접근 방식에 제약</div>
                      <div className="text-xs text-slate-400 mt-0.5">(건물ㆍ지붕 구조에 따라 별도 장비 필요)</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 bg-blue-50/40 border-r border-slate-200">
                      <div>현장 조건에 맞춰 작업 방식 적용</div>
                      <div className="text-xs text-[#1d61e8] font-semibold mt-0.5">(외벽ㆍ지붕형 태양광 등 다양한 현장 대응)</div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 bg-slate-50/50">
                      현장별 작업 방식 최적화
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm">
                <Award className="w-5 h-5 text-[#1d61e8] shrink-0" />
                <span>
                  현장 조건에 맞는 작업 방식과 견적을 제안해 드립니다.
                </span>
              </div>
              <button
                onClick={() => openTestModal('비교표 검토 후 견적 문의')}
                className="px-6 py-2.5 rounded bg-[#1d61e8] hover:bg-blue-600 text-white font-bold text-xs shrink-0 transition-all cursor-pointer shadow-xs"
              >
                견적 문의하기
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 8. SAMPLE TEST PROCESS (Corporate 4-Step Process Cards) */}
      <section id="process" className="py-24 lg:py-32 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white text-[#1d61e8] text-xs font-bold uppercase tracking-wider border border-slate-200 shadow-xs">
              SERVICE WORKFLOW
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              투명하고 체계적인 <br />
              <span className="text-[#1d61e8]">
                드론 세척 4단계 진행 절차
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
{`간편한 견적 문의부터 현장 확인과 작업 진행까지, 
체계적인 절차로 안전하고 효율적인 세척 서비스를 제공합니다.`}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 01 */}
            <div className="bg-white p-7 sm:p-8 rounded-xl border border-slate-200 shadow-xs relative space-y-5 hover:border-slate-400 transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-bold text-xs tracking-wider">
                    STEP 01
                  </span>
                  <div className="w-10 h-10 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  간편 견적 문의
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  세척이 필요한 건물 외벽이나 태양광 패널의 현장 정보를 남겨주세요.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  <strong>💡 태양광 발전소 문의 시:</strong><br />
                  설치 용량(kW)과 설치 년도(기간)를 함께 알려주시면 보다 정확한 견적 안내가 가능합니다.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-white p-7 sm:p-8 rounded-xl border border-slate-200 shadow-xs relative space-y-5 hover:border-slate-400 transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-bold text-xs tracking-wider">
                    STEP 02
                  </span>
                  <div className="w-10 h-10 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  위성 지도 기반 1차 가견적 안내
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  최신 위성 지도 분석 시스템을 통해 면적과 구조를 파악합니다.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  현장 방문 전, 가장 빠르게 대략적인 1차 가견적을 신속히 회신해 드립니다.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white p-7 sm:p-8 rounded-xl border border-slate-200 shadow-xs relative space-y-5 hover:border-slate-400 transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-bold text-xs tracking-wider">
                    STEP 03
                  </span>
                  <div className="w-10 h-10 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  현장 방문 및 정밀 진단
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  1차 견적 확인 후 현장 조건을 보다 정확하게 확인하기 위해 필요 시 전문 담당자가 현장을 방문합니다.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  <strong>💡 현장 여건 확인:</strong><br />
                  건물 구조, 지붕 형태, 오염 상태, 작업 공간 등을 확인하여 최적의 작업 방법과 최종 견적을 안내합니다.
                </p>
              </div>
            </div>

            {/* Step 04 */}
            <div className="bg-white p-7 sm:p-8 rounded-xl border-2 border-[#1d61e8] shadow-xs relative space-y-5 hover:border-blue-700 transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-[#1d61e8] text-white font-bold text-xs tracking-wider">
                    STEP 04
                  </span>
                  <div className="w-10 h-10 rounded bg-blue-50 text-[#1d61e8] flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  무료 시연 및 세척 진행 <br className="hidden xl:block" />
                  <span className="text-xs font-semibold text-slate-500 block sm:inline xl:block mt-0.5 sm:mt-0 xl:mt-0.5">(현장 조건에 따라 선택 진행)</span>
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">
{`현장 규모와 조건에 따라 지정 구간 무료 시연이 가능합니다.
시연 결과 확인 후 작업 여부와 일정을 협의합니다.`}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-700 bg-blue-50/70 p-3 rounded-lg border border-blue-100 leading-relaxed">
                  <strong className="text-[#1d61e8]">💡 현장 조건에 따라 무료 시연 가능:</strong><br />
                  대규모 현장 등 시연이 필요한 경우, 일부 구간을 먼저 세척하여 작업 결과를 직접 확인할 수 있습니다.
                </p>
              </div>
            </div>

          </div>

          {/* Photo Attachment Banner in Sample Test Procedure */}
          <div className="mt-10 p-6 sm:p-8 bg-slate-900 text-white border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-slate-800 text-white flex items-center justify-center shrink-0 border border-slate-700">
                <ImageIcon className="w-6 h-6 text-[#1d61e8]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <span>건물 / 현장 오염 사진 첨부 가능</span>
                  <span className="px-2 py-0.5 bg-[#1d61e8] text-white text-[11px] rounded font-bold">신속 가견적</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  외벽 오염 상태나 태양광/유리창 사진을 함께 업로드하시면 더욱 신속하고 정확하게 시범 테스트를 안내해 드립니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => openTestModal('현장 사진 첨부 샘플 테스트 신청')}
              className="px-6 py-3 rounded bg-[#1d61e8] hover:bg-blue-600 text-white font-bold text-xs shrink-0 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4 text-white" />
              사진 첨부하고 신청하기
            </button>
          </div>

        </div>
      </section>

      {/* 10. 견적문의 섹션 (신규 견적문의 & 나의 견적문의 조회/관리 네모 박스 선택형) */}
      <section id="quote-section" className="py-24 lg:py-32 bg-slate-50 text-slate-900 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">견적문의</h2>
          </div>

          {/* 2가지 메뉴 네모 박스 형태 선택 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            
            {/* 박스 1: 신규 견적문의 */}
            <button
              type="button"
              onClick={() => setQuoteActiveTab('new')}
              className={`p-4 sm:p-7 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 sm:gap-5 ${
                quoteActiveTab === 'new'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-[#1d61e8]'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0 ${
                quoteActiveTab === 'new' ? 'bg-[#1d61e8] text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                <FileEdit className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-xl font-black tracking-tight">신규 견적문의</span>
                  {quoteActiveTab === 'new' && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-[#1d61e8] text-white">선택됨</span>
                  )}
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed ${quoteActiveTab === 'new' ? 'text-slate-300' : 'text-slate-500'}`}>
                  건물 외벽, 태양광 패널, 고층 유리창 세척 견적을 신청합니다.
                </p>
              </div>
            </button>

            {/* 박스 2: 나의 견적문의 조회/관리 */}
            <button
              type="button"
              onClick={() => setQuoteActiveTab('my')}
              className={`p-4 sm:p-7 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 sm:gap-5 ${
                quoteActiveTab === 'my'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-[#1d61e8]'
                  : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0 ${
                quoteActiveTab === 'my' ? 'bg-[#1d61e8] text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-base sm:text-xl font-black tracking-tight leading-tight">
                    나의 견적문의 <br />
                    조회/관리
                  </span>
                  {quoteActiveTab === 'my' && (
                    <span className="px-2 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-[#1d61e8] text-white shrink-0 mt-0.5">선택됨</span>
                  )}
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed ${quoteActiveTab === 'my' ? 'text-slate-300' : 'text-slate-500'}`}>
                  설정하신 비밀번호로 기존에 작성한 문의 내용과 담당자 답변을 확인하고 관리합니다.
                </p>
              </div>
            </button>
          </div>

          {/* TAB 1: 신규 견적문의 화면 */}
          {quoteActiveTab === 'new' ? (
            <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 md:p-12 rounded-xl border border-slate-200 shadow-sm space-y-6 sm:space-y-8">
              
              {/* 보안 및 비공개 안내 배너 */}
              <div className="p-4 sm:p-5 rounded-lg bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded bg-slate-800 text-[#1d61e8] flex items-center justify-center shrink-0 border border-slate-700">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                      <span>100% 비공개 보안 접수</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[11px] border border-emerald-800 font-semibold">보안 보장</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      작성하신 모든 견적문의는 비공개 처리되며, 작성자 본인(직접 설정한 비밀번호)과 관리자만 내용을 확인할 수 있습니다.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuoteActiveTab('my')}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0 border border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  기존 문의 조회하기 →
                </button>
              </div>

              {isSubmitted ? (
                /* 접수 완료 화면 */
                <div className="p-10 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-5">
                  <div className="w-16 h-16 rounded-full bg-[#1d61e8] text-white flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">견적문의가 비공개로 안전하게 접수되었습니다</h3>
                    <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                      작성하신 견적문의가 등록되었습니다.<br />
                      작성 시 설정하신 <strong>비밀번호</strong>로 언제든 <strong>[나의 견적문의 조회/관리]</strong>에서 작성 내용 및 담당자 공식 답변을 확인하실 수 있습니다.
                    </p>
                    <p className="text-xs text-slate-500 pt-1">
                      담당자(조영수 이사: 010-8564-2682)가 신속히 내용을 검토 후 등록해주신 연락처로 유선 안내해 드립니다.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setQuoteActiveTab('my');
                      }}
                      className="px-6 py-3 rounded-lg bg-[#1d61e8] text-white text-xs sm:text-sm font-bold hover:bg-[#1550c6] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      <ClipboardList className="w-4 h-4" />
                      나의 견적문의 조회/관리 확인하기
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                    >
                      새로운 문의 추가 작성
                    </button>
                  </div>
                </div>
              ) : (
                /* 견적문의 작성 폼 */
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* 문의 제목 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      문의 제목 <span className="text-[#1d61e8]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="예: [견적요청] 판교 테크노밸리 12층 사옥 외벽 세척 및 1층 시범 테스트"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:border-[#1d61e8] focus:ring-1 focus:ring-[#1d61e8] focus:outline-none"
                    />
                  </div>

                  {/* 희망 서비스 항목 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      희망 서비스 항목 <span className="text-[#1d61e8]">*</span>
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:border-[#1d61e8] focus:ring-1 focus:ring-[#1d61e8] focus:outline-none bg-white"
                    >
                      <option value="건물외벽청소">건물외벽청소</option>
                      <option value="태양광청소">태양광청소</option>
                      <option value="유리창청소">유리창청소</option>
                      <option value="기타/상담 문의">기타/상담 문의</option>
                    </select>
                  </div>

                  {/* 신청자 성함 및 회사명 */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        성함 / 담당자명 <span className="text-[#1d61e8]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="예: 홍길동 팀장"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:border-[#1d61e8] focus:ring-1 focus:ring-[#1d61e8] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        회사명 / 기관명 / 건물명
                      </label>
                      <input
                        type="text"
                        placeholder="예: (주)한국시설관리 / ○○빌딩 관리사무소"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:border-[#1d61e8] focus:ring-1 focus:ring-[#1d61e8] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* 연락처 및 사용자 비밀번호 직접 설정 */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        연락처 (휴대전화) <span className="text-[#1d61e8]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="010-0000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:border-[#1d61e8] focus:ring-1 focus:ring-[#1d61e8] focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          글 비밀번호 직접 설정 <span className="text-[#1d61e8]">*</span>
                        </label>
                        <span className="text-[11px] text-[#1d61e8] font-bold">본인 확인 및 관리용</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showFormPassword ? "text" : "password"}
                          required
                          placeholder="비밀번호 설정 (조회 시 사용)"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-4 pr-10 py-3 rounded-lg border border-slate-300 text-sm focus:border-[#1d61e8] focus:ring-1 focus:ring-[#1d61e8] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowFormPassword(!showFormPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                          title={showFormPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                        >
                          {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        🔒 작성 후 [나의 견적문의 조회/관리]에서 본인 글을 열람·관리할 때 입력합니다.
                      </p>
                    </div>
                  </div>

                  {/* 이메일 주소 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      이메일 주소 (선택)
                    </label>
                    <input
                      type="email"
                      placeholder="example@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:border-[#1d61e8] focus:ring-1 focus:ring-[#1d61e8] focus:outline-none"
                    />
                  </div>

                  {/* 건물 주소 및 상세 정보 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      건물 주소 및 현장 세부 정보
                    </label>
                    <p className="text-[11px] text-[#1d61e8] font-semibold mb-1.5">
                      * 세척 대상 주소, 층수, 외벽 마감재(유리, 석재, 알루미늄 판넬 등), 오염 상태를 작성해 주시면 더욱 정확한 가견적이 산출됩니다.
                    </p>
                    <textarea
                      rows={3}
                      placeholder="예: 서울 강남구 테헤란로 123, 지상 15층 커튼월 유리빌딩, 분진 및 찌든때 세척 견적 문의"
                      value={formData.buildingDetails}
                      onChange={(e) => setFormData({ ...formData, buildingDetails: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm focus:border-[#1d61e8] focus:ring-1 focus:ring-[#1d61e8] focus:outline-none resize-none"
                    />
                  </div>

                  {/* 사진 첨부 */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      현장 / 건물 오염 사진 첨부 (선택)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors border border-slate-300 flex items-center gap-1.5 shrink-0">
                        <Upload className="w-4 h-4 text-[#1d61e8]" />
                        사진 파일 선택
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handlePhotoUpload(e.target.files, setFormPhotos)}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-slate-500">
                        {formPhotos.length > 0 ? `${formPhotos.length}장의 사진이 첨부되었습니다.` : '외벽, 유리, 패널 오염 사진을 첨부하시면 빠른 검토가 가능합니다.'}
                      </span>
                    </div>

                    {formPhotos.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formPhotos.map((photo, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 group">
                            <img src={photo} alt={`첨부사진 ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(idx, setFormPhotos)}
                              className="absolute top-0.5 right-0.5 bg-slate-900/80 text-white p-0.5 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 개인정보 수집 동의 */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>개인정보 수집 및 이용 동의</span>
                      <span className="text-[11px] text-[#1d61e8] font-bold">[필수]</span>
                    </div>
                    <div className="text-[11px] text-slate-500 leading-relaxed bg-white p-2.5 rounded border border-slate-200 max-h-20 overflow-y-auto">
                      1. 수집 및 이용 목적: 건물 외벽/시설 세척 견적 상담 및 현장 안내<br />
                      2. 수집 항목: 성함/담당자명, 연락처, 회사명/건물명, 이메일, 건물 주소 및 오염 사진<br />
                      3. 보유 및 이용 기간: 문의 처리 및 서비스 완료 후 1년간 보관 (관련 법령에 따름)
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        required
                        className="w-4 h-4 rounded border-slate-300 text-[#1d61e8] focus:ring-[#1d61e8]"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        개인정보 수집 및 이용에 동의합니다. <span className="text-[#1d61e8]">*</span>
                      </span>
                    </label>
                  </div>

                  {/* 제출 버튼 */}
                  <button
                    type="submit"
                    className="w-full py-4 rounded-lg bg-[#1d61e8] hover:bg-[#1550c6] text-white font-black text-sm tracking-wide shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    견적문의 접수하기
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* TAB 2: 나의 견적문의 조회/관리 화면 */
            <div className="max-w-5xl mx-auto space-y-6">

              {/* 상단 안내 바 및 관리자 상태 */}
              <div className="p-6 sm:p-7 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800 text-[#1d61e8] text-xs font-bold border border-slate-700">
                    <Lock className="w-3.5 h-3.5" />
                    비공개 보안 문의 내역 관리
                  </div>
                  <h3 className="text-2xl font-black text-white">나의 견적문의 조회 및 관리</h3>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                    모든 문의글은 안전하게 비공개로 보호됩니다. 본인의 문의글을 클릭하신 후 <strong>작성 시 직접 설정하신 비밀번호</strong>를 입력하시면 상세 내용과 관리자 답변을 확인하고 관리하실 수 있습니다.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {isAdminAuthenticated ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold flex items-center gap-1.5">
                        <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                        관리자 권한 활성화됨
                      </span>
                      <button
                        onClick={handleAdminLogout}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                      >
                        로그아웃
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAdminLoginModal(true)}
                      className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#1d61e8]" />
                      관리자 로그인
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setQuoteActiveTab('new')}
                    className="px-4 py-2.5 rounded-lg bg-[#1d61e8] hover:bg-[#1550c6] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    신규 견적문의 작성
                  </button>
                </div>
              </div>

              {/* 검색 및 필터 컨트롤 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                  
                  {/* 검색창 */}
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="접수번호, 회사명, 성함, 전화번호 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-xs focus:border-[#1d61e8] focus:ring-1 focus:ring-[#1d61e8] focus:outline-none"
                    />
                  </div>

                  {/* 카테고리 필터 */}
                  <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                    {['전체', '건물외벽청소', '태양광청소', '유리창청소', '기타/상담 문의'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-[#1d61e8] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* 문의 목록 */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-700">
                  <span>견적문의 목록 ({filteredInquiries.length}건)</span>
                  <span className="text-slate-500 font-normal">
                    목록 클릭 시 작성 당시 설정하신 비밀번호를 입력하여 상세 내용과 답변을 확인하실 수 있습니다.
                  </span>
                </div>

                {filteredInquiries.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-bold">검색 조건에 해당되는 문의 내역이 없습니다.</p>
                    <p className="text-xs text-slate-400">검색어를 변경하거나 카테고리 필터를 '전체'로 변경해 보세요.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredInquiries.map((item, idx) => {
                      const isItemUnlocked = isAdminAuthenticated || unlockedInquiryIds.includes(item.id);
                      return (
                        <div
                          key={`${item.id}-${idx}`}
                          onClick={() => handleOpenDetailModal(item)}
                          className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                        >
                          <div className="space-y-2 max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-extrabold text-[#1d61e8] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                                {item.id}
                              </span>
                              <span className="text-slate-400">{item.createdAt}</span>
                              <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-[11px] border border-slate-200 flex items-center gap-1">
                                <Lock className="w-3 h-3 text-slate-500" />
                                비공개
                              </span>
                              {item.photos && item.photos.length > 0 && (
                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px] border border-slate-200 flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3 text-slate-600" />
                                  사진 {item.photos.length}장
                                </span>
                              )}
                            </div>

                            <div>
                              <h4 className="text-base font-bold text-slate-900 group-hover:text-[#1d61e8] transition-colors flex items-center gap-2">
                                {item.title}
                              </h4>
                              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                                <span>희망 서비스: <strong className="text-slate-700">{item.serviceType}</strong></span>
                                <span>•</span>
                                {isItemUnlocked ? (
                                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                                    <Unlock className="w-3.5 h-3.5" />
                                    {item.company} ({item.name}) / {item.phone}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 flex items-center gap-1">
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                    인적정보 및 건물상세 비공개 (🔒 비밀번호 확인 필요)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-bold ${
                                item.status === '접수완료'
                                  ? 'bg-blue-50 text-[#1d61e8] border border-blue-200'
                                  : item.status === '방문견적 예정'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : item.status === '상담대기'
                                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {item.status}
                            </span>

                            {isAdminAuthenticated && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteInquiry(item.id);
                                }}
                                className="px-3 py-1.5 rounded bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="관리자 전용 문의글 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                삭제
                              </button>
                            )}

                            <button className="px-3.5 py-2 rounded-lg bg-slate-100 group-hover:bg-[#1d61e8] group-hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                              {isItemUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              {isItemUnlocked ? '상세보기 / 답변' : '비밀번호 입력'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </section>

      {/* 11. FOOTER (Corporate Dark Slate Theme) */}
      <footer id="contact" className="py-14 lg:py-18 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* 1. 푸터 상단 상담 영역 */}
          <div className="p-7 sm:p-9 rounded-2xl bg-slate-800/90 border border-slate-700/90 shadow-xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2.5 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1d61e8]/20 border border-[#1d61e8]/40 text-[#4d8eff] text-xs font-bold">
                  <MapPin className="w-3.5 h-3.5 text-[#4d8eff]" />
                  <span>전국 출장 서비스 가능</span>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
                  드론으로 건물외벽ㆍ태양광패널ㆍ유리창 청소를 더 안전하고 정밀하게
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  건물위생관리업 정식 인허가 기업 드론클린프로가 시설관리 책임자의 예산과 안전 고민을 해결해 드립니다.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <a
                  href="tel:01085642682"
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-md"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>전화 상담: 010-8564-2682</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleQuoteNavClick('new')}
                  className="px-6 py-3.5 rounded-xl bg-[#1d61e8] hover:bg-[#1550c6] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-md cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>온라인 견적문의 바로가기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 푸터 메인 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pt-2">
            
            {/* 2. 회사 소개 영역 (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-2">
                <div className="font-black text-xl text-white flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden shrink-0 mt-0.5 border-0">
                    <img
                      src={getImage('logo')}
                      alt="드론클린프로 로고"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = logoIconImg;
                      }}
                    />
                  </div>
                  <span className="leading-tight">
                    드론클린프로
                    <br />
                    (DRONE CLEANPRO)
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  건물위생관리업을 기반으로 건물 외벽, 태양광 패널, 유리창을 산업용 드론과 특수 개발한 드론 전용 노즐로 안전하고 신속하게 세척하는 드론청소 전문 업체입니다.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-200">주요 등록 및 인증사항</div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1d61e8] shrink-0 mt-0.5" />
                    <span>건물위생관리업 정식 인허가 등록 (제 2026-00002호)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1d61e8] shrink-0 mt-0.5" />
                    <span>국토교통부 서울지방항공청 초경량비행장치 사용사업 정식 등록</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1d61e8] shrink-0 mt-0.5" />
                    <span>드론배상책임보험 가입 (대인/대물 전액 보상)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. 전문 세척 솔루션 (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-3 text-xs">
              <div className="font-bold text-white text-sm">전문 세척 솔루션</div>
              <ul className="space-y-2.5 text-slate-300 font-medium">
                <li>• 건물 외벽 드론 세척</li>
                <li>• 태양광 패널 드론 세척</li>
                <li>• 유리창 & 커튼월</li>
              </ul>
            </div>

            {/* 4. 주요 메뉴 (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-3 text-xs">
              <div className="font-bold text-white text-sm">주요 메뉴</div>
              <div className="flex flex-col gap-2.5 text-slate-300 font-medium">
                <button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors text-left cursor-pointer">사업영역</button>
                <button onClick={() => document.getElementById('technology')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors text-left cursor-pointer">기술소개</button>
                <button onClick={() => document.getElementById('eco-safety')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors text-left cursor-pointer">세척방식</button>
                <button onClick={() => document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors text-left cursor-pointer">서비스 비교</button>
                <button onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors text-left cursor-pointer">진행안내</button>
                <button onClick={() => handleQuoteNavClick('new')} className="text-[#4d8eff] font-bold hover:underline text-left cursor-pointer">견적문의</button>
                <button onClick={navigateToEducation} className="text-amber-400 hover:text-amber-300 font-bold hover:underline text-left cursor-pointer flex items-center gap-1">
                  <span>드론 세척 교육사업</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">신규</span>
                </button>
              </div>
            </div>

            {/* 5. 고객지원 및 본사 (lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-3 text-xs text-slate-300">
              <div className="font-bold text-white text-sm">고객지원 및 본사</div>
              <div className="space-y-2.5 leading-relaxed">
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">주소</span>
                  <span className="text-slate-200">경기도 오산시 오산로 190번길 42, 2층 2030호</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">대표전화</span>
                  <a href="tel:01085642682" className="text-white hover:text-[#4d8eff] font-bold text-sm">010-8564-2682 (총괄이사 조영수)</a>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">견적접수 이메일</span>
                  <a href="mailto:dcpro25@naver.com" className="hover:text-white text-slate-200">dcpro25@naver.com</a>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">상담시간</span>
                  <span className="text-slate-200">평일 08:30 ~ 18:30 (주말 및 공휴일 상담 가능)</span>
                </div>
              </div>
            </div>

          </div>

          {/* 6. 하단 사업자 정보 */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-xs">
            <div>
              드론클린프로 | 대표: 이빛나 | 사업자등록번호: 110-35-78490
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <p>© 2026 DroneCleanPro. All rights reserved.</p>
              <span className="text-slate-700">|</span>
              <button onClick={() => setShowAdminLoginModal(true)} className="hover:text-slate-300 text-slate-500 cursor-pointer text-[11px]">
                관리자 로그인
              </button>
            </div>
          </div>

        </div>
      </footer>
      </main>
      </>
      )}

      {/* DETAIL MODAL POPUP FOR INQUIRY */}
      {selectedInquiryDetail && (() => {
        const isDetailUnlocked = isAdminAuthenticated || unlockedInquiryIds.includes(selectedInquiryDetail.id);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
              
              <button
                onClick={handleCloseDetailModal}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    접수번호: {selectedInquiryDetail.id}
                  </span>
                  <span className="text-xs text-slate-400">{selectedInquiryDetail.createdAt}</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                  {selectedInquiryDetail.title}
                </h3>
              </div>

              {!isDetailUnlocked ? (
                /* Password Protection Verification Screen */
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">🔒 비밀글 상세보기 인증</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      이 문의글의 개인정보 및 상세내용은 작성자 본인과 관리자만 조회하실 수 있습니다.<br />
                      작성 시 입력하신 <strong>숫자 4자리 비밀번호</strong>를 입력해 주세요.
                    </p>
                  </div>

                  <form onSubmit={handleUnlockInquiry} className="space-y-3 max-w-xs mx-auto">
                    <input
                      type="password"
                      maxLength={4}
                      required
                      autoFocus
                      value={detailPasswordInput}
                      onChange={(e) => setDetailPasswordInput(e.target.value)}
                      placeholder="비밀번호 4자리"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center font-black text-2xl tracking-widest focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                    />
                    {detailPasswordError && (
                      <p className="text-xs font-bold text-red-600">{detailPasswordError}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition-all"
                    >
                      비밀번호 확인 및 내용 보기
                    </button>
                  </form>

                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseDetailModal();
                        setShowAdminLoginModal(true);
                      }}
                      className="text-xs text-slate-500 hover:text-blue-600 font-semibold underline"
                    >
                      관리자 로그인하기
                    </button>
                  </div>
                </div>
              ) : (
                /* Unlocked Full Detail View */
                <div className="space-y-5">
                  
                  {/* Info Table */}
                  <div className="space-y-2.5 border-t border-b border-slate-200 py-4 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">신청자명:</span>
                      <span className="font-bold text-slate-900">{selectedInquiryDetail.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">회사 / 건물명:</span>
                      <span className="font-bold text-slate-900">{selectedInquiryDetail.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">연락처:</span>
                      <span className="font-bold text-blue-700">{selectedInquiryDetail.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">이메일 주소:</span>
                      <span className="font-bold text-slate-900">{selectedInquiryDetail.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">희망 서비스:</span>
                      <span className="font-bold text-slate-900">{selectedInquiryDetail.serviceType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-500">진행 상태:</span>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        selectedInquiryDetail.status === '답변완료'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : selectedInquiryDetail.status === '방문견적 예정'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : selectedInquiryDetail.status === '상담대기'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-blue-50 text-[#1d61e8] border border-blue-200'
                      }`}>
                        {selectedInquiryDetail.status}
                      </span>
                    </div>
                    <div className="pt-2">
                      <span className="font-bold text-slate-500 block mb-1">건물 및 신청 상세내용:</span>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                        {selectedInquiryDetail.buildingDetails}
                      </div>
                    </div>

                    {/* Uploaded Photos Display */}
                    {selectedInquiryDetail.photos && selectedInquiryDetail.photos.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <span className="font-bold text-slate-700 block flex items-center gap-1">
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                          첨부된 현장 사진 ({selectedInquiryDetail.photos.length}장):
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedInquiryDetail.photos.map((photo, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPreviewPhotoModalUrl(photo)}
                              className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 block text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600"
                            >
                              <img
                                src={photo}
                                alt={`첨부사진 ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                                <Search className="w-3.5 h-3.5" />
                                <span>사진 크게 보기</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Admin Reply or Customer Response Display */}
                  {isAdminAuthenticated ? (
                    <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-blue-950 text-xs flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          관리자 답글 및 상태 관리
                        </span>
                        <span className="text-[11px] text-blue-700 font-bold">관리자 전용</span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-700">
                          진행 상태 설정
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setAdminStatusSelect((prev) =>
                                prev === '답변완료' ? '접수완료' : '답변완료'
                              )
                            }
                            className={`py-2 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              adminStatusSelect === '답변완료'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-offset-1 ring-emerald-500'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {adminStatusSelect === '답변완료' && <Check className="w-3.5 h-3.5" />}
                            <span>답변완료</span>
                          </button>
                          <span className="text-[11px] text-slate-500">
                            {adminStatusSelect === '답변완료'
                              ? '현재 고객에게 [답변완료] 상태로 표시됩니다.'
                              : '버튼을 클릭하면 [답변완료] 상태로 변경됩니다.'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          답글/답변 내용 입력
                        </label>
                        <textarea
                          rows={3}
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder="신청 고객에게 안내할 답변 내용이나 현장 방문 일정 등을 작성하세요."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white resize-none"
                        />
                      </div>

                      <div className="pt-2 border-t border-blue-200/60 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteInquiry(selectedInquiryDetail.id)}
                          className="px-3.5 py-2 rounded-xl bg-red-100 hover:bg-red-600 text-red-700 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          문의글 삭제
                        </button>
                        <button
                          onClick={handleSaveAdminReply}
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-all"
                        >
                          답글 및 상태 저장하기
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {selectedInquiryDetail.reply ? (
                        <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-blue-900 text-xs flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                              드론클린프로 관리자 답변
                            </span>
                            {selectedInquiryDetail.replyCreatedAt && (
                              <span className="text-[11px] text-blue-600 font-medium">
                                {selectedInquiryDetail.replyCreatedAt}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                            {selectedInquiryDetail.reply}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 text-center font-medium">
                          ⏳ 현재 담당자(조영수 이사: 010-8564-2682)가 문의 내용을 확인하고 있습니다. 빠른 시일 내 안내해 드리겠습니다.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <a
                      href="tel:01085642682"
                      className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow text-center flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-4 h-4 text-white" />
                      직통 전화 (010-8564-2682)
                    </a>
                    <button
                      onClick={handleCloseDetailModal}
                      className="flex-1 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs text-center"
                    >
                      닫기
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* ADMIN LOGIN MODAL POPUP (when clicking header link without auth) */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative text-center">
            
            <button
              onClick={() => setShowAdminLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-14 h-14 rounded-xl bg-slate-900 text-[#1d61e8] flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">관리자 보안 인증</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                견적 및 문의 내역은 개인정보보호를 위해 관리자 비밀번호 입력 후 조회할 수 있습니다.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="관리자 비밀번호 입력"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-center font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                {adminAuthError && (
                  <p className="text-xs font-bold text-red-600 mt-2">{adminAuthError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition-all"
              >
                관리자 인증
              </button>
            </form>

          </div>
        </div>
      )}

      {/* SAMPLE TEST MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                RISK-FREE CONSULTING
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                드론 세척 무료 견적 및 테스트 문의
              </h3>
              <p className="text-xs text-slate-600">
                문의 주제: <strong className="text-blue-700 font-bold">{modalServiceType}</strong>
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.currentTarget;
                const titleVal = (formEl.elements.namedItem('modalTitle') as HTMLInputElement)?.value || '';
                const passwordVal = (formEl.elements.namedItem('modalPassword') as HTMLInputElement)?.value || '1234';
                const nameVal = (formEl.elements.namedItem('modalName') as HTMLInputElement)?.value || '담당자';
                const phoneVal = (formEl.elements.namedItem('modalPhone') as HTMLInputElement)?.value || '010-0000-0000';
                const locVal = (formEl.elements.namedItem('modalLoc') as HTMLInputElement)?.value || '';

                addInquiryRecord({
                  title: titleVal,
                  password: passwordVal,
                  name: nameVal,
                  phone: phoneVal,
                  serviceType: modalServiceType,
                  buildingDetails: locVal || '팝업 무료 샘플/견적 신청',
                  requestTest: true,
                  photos: modalPhotos,
                });

                alert('문의 및 샘플 테스트 신청이 성공적으로 접수되었습니다! 설정하신 4자리 비밀번호로 견적문의 내역에서 확인하실 수 있습니다.');
                setIsModalOpen(false);
                setModalPhotos([]);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  문의 제목 <span className="text-blue-600">*</span>
                </label>
                <input
                  name="modalTitle"
                  type="text"
                  required
                  placeholder="예: [샘플테스트] 건물 외벽 세척 시범 테스트 문의"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    담당자 성함 <span className="text-blue-600">*</span>
                  </label>
                  <input
                    name="modalName"
                    type="text"
                    required
                    placeholder="예: 홍길동 팀장"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    연락처 <span className="text-blue-600">*</span>
                  </label>
                  <input
                    name="modalPhone"
                    type="tel"
                    required
                    placeholder="예: 010-8564-2682"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  글 비밀번호 (숫자 4자리) <span className="text-blue-600">*</span>
                </label>
                <input
                  name="modalPassword"
                  type="password"
                  required
                  maxLength={4}
                  pattern="\d{4}"
                  placeholder="숫자 4자리 (견적글 조회용)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  건물 상세 정보 및 주소
                </label>
                <p className="text-[11px] text-blue-600 font-semibold mb-1.5 leading-relaxed">
                  * 세척이 필요한 건물/시설의 주소를 남겨주세요. (태양광 발전소 문의 시: 설치 용량(kW)을 함께 작성해 주시면 더욱 정확합니다.)
                </p>
                <input
                  name="modalLoc"
                  type="text"
                  placeholder="예: 서울 강남구 테헤란로 123, 15층 빌딩 커튼월 외벽 세척 문의"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Photo Upload Input in Popup Modal */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  📷 현장 / 건물 오염 사진 첨부 (선택)
                </label>
                
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors border border-slate-300 flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    사진 선택
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoUpload(e.target.files, setModalPhotos)}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-500">
                    {modalPhotos.length > 0 ? `${modalPhotos.length}장의 사진 첨부됨` : '여러 장 추가 가능'}
                  </span>
                </div>

                {/* Thumbnails */}
                {modalPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {modalPhotos.map((photo, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200">
                        <img src={photo} alt={`미리보기 ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx, setModalPhotos)}
                          className="absolute top-0.5 right-0.5 bg-slate-900/80 text-white p-0.5 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                ✔️ 사전 테스트 및 상담은 건물 외벽 소규모 구역에 한해 진행되며, 별도의 비용 부담이 없습니다.
              </div>

              {/* Privacy Policy Agreement */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>개인정보 수집 및 이용 동의</span>
                  <span className="text-[11px] text-blue-600 font-bold">[필수]</span>
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 max-h-20 overflow-y-auto">
                  1. 수집 및 이용 목적: 건물 외벽/시설 세척 견적 상담, 현장 사전점검 및 시범 테스트 안내<br />
                  2. 수집 항목: 성함/담당자명, 연락처, 회사명/건물명, 건물 주소 및 오염 사진<br />
                  3. 보유 및 이용 기간: 문의 처리 및 서비스 완료 후 1년간 보관 (관련 법령에 따름)
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    개인정보 수집 및 이용에 동의합니다. <span className="text-blue-600">*</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition-all"
              >
                신청 및 문의하기
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ADMIN DELETE CONFIRMATION MODAL */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">문의글 삭제</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                정말 선택하신 문의글(<strong className="text-slate-900 font-bold">{deleteTargetId}</strong>)을 삭제하시겠습니까?
              </p>
              <p className="text-[11px] text-red-600 font-bold">
                ⚠️ 삭제된 데이터는 복구할 수 없습니다.
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteInquiry(deleteTargetId)}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INQUIRY SUBMISSION SUCCESS POPUP MODAL */}
      {showSubmitSuccessModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-blue-100 text-center relative">
            <button
              type="button"
              onClick={() => setShowSubmitSuccessModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1d61e8] flex items-center justify-center mx-auto shadow-inner border border-blue-100">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">작성 완료 되었습니다.</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                작성 하신 내용은 <strong className="text-[#1d61e8] font-bold">견적문의 내역</strong>에서 확인 하실 수 있습니다.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSubmitSuccessModal(false);
                  handleQuoteNavClick('my');
                }}
                className="flex-1 py-3.5 rounded-xl bg-[#1d61e8] hover:bg-[#1550c6] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                나의 견적문의 조회/관리 확인하기
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowSubmitSuccessModal(false)}
                className="py-3.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SITE IMAGE MANAGER MODAL */}
      <ImageManagerModal
        isOpen={showImageManagerModal}
        onClose={() => setShowImageManagerModal(false)}
        siteImages={siteImages}
        onUpdateImage={handleUpdateSiteImage}
        onResetImage={handleResetSiteImage}
        onResetAllImages={handleResetAllSiteImages}
        onBatchImportImages={handleBatchImportImages}
        focusedKey={focusedImageSlotKey}
      />

      {/* PHOTO PREVIEW LIGHTBOX MODAL */}
      {previewPhotoModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewPhotoModalUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top close bar */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <span className="text-xs font-bold flex items-center gap-1.5 text-slate-300">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                현장 첨부 사진 원본 보기
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhotoModalUrl(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <X className="w-5 h-5" />
                <span>닫기</span>
              </button>
            </div>

            {/* Image viewport */}
            <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 max-h-[80vh] flex items-center justify-center w-full">
              <img
                src={previewPhotoModalUrl}
                alt="첨부 사진 확대"
                className="max-h-[78vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            <div className="pt-3 text-center">
              <p className="text-xs text-slate-400">바깥 영역을 클릭하거나 우측 상단 닫기 버튼을 누르면 이전 화면으로 돌아갑니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* 12. FLOATING ACTION BUTTONS (BOTTOM-RIGHT) */}
      <div className="fixed bottom-3.5 right-3.5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        {/* 맨 위로 이동 (↑) 버튼 */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/95 hover:bg-slate-800 text-white shadow-xl border border-slate-700 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm group"
          title="맨 위로 이동"
          aria-label="맨 위로 이동"
        >
          <ArrowUp className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
        </button>

        {/* 실시간 견적문의 또는 교육 상담 문의 버튼 */}
        {currentPage === 'education' ? (
          <button
            type="button"
            onClick={() => setShowEduConsultModal(true)}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#1d61e8] hover:bg-[#1550c6] text-white font-black text-xs shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer border border-blue-400/40"
          >
            <span>교육 상담 문의</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleQuoteNavClick('new')}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#1d61e8] hover:bg-[#1550c6] text-white font-black text-xs shadow-xl flex items-center gap-1.5 sm:gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-blue-400/40"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>실시간 견적문의</span>
          </button>
        )}

        {/* 전화 상담 버튼 */}
        <a
          href="tel:01085642682"
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-white font-black text-xs shadow-xl flex items-center gap-1.5 sm:gap-2 transition-all hover:scale-105 active:scale-95 border border-slate-700 backdrop-blur-sm"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">전화 상담 010-8564-2682</span>
          <span className="sm:hidden">전화상담</span>
        </a>
      </div>

      {/* ADMIN TOAST NOTIFICATION */}
      {adminToastMessage && (
        <div className="fixed bottom-28 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2.5 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{adminToastMessage}</span>
        </div>
      )}

    </div>
  );
}

