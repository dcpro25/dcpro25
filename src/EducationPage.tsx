import React, { useState } from 'react';
import {
  GraduationCap,
  Wrench,
  Droplets,
  PlaySquare,
  Compass,
  Briefcase,
  ShieldCheck,
  FileText,
  Calculator,
  ChevronRight,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  PhoneCall,
  ExternalLink,
  X,
  Send,
  Sparkles,
  Layers,
  AlertCircle,
  HelpCircle,
  Lock,
  Camera,
  Menu,
  Phone
} from 'lucide-react';

interface EducationPageProps {
  onNavigateHome: () => void;
  onOpenAdminLogin: () => void;
  isAdminAuthenticated: boolean;
  onAdminLogout: () => void;
  onOpenImageManager: () => void;
  getImage: (key: string) => string;
  onAddInquiry: (inquiry: any) => void;
  showConsultModal?: boolean;
  setShowConsultModal?: (show: boolean) => void;
}

export default function EducationPage({
  onNavigateHome,
  onOpenAdminLogin,
  isAdminAuthenticated,
  onAdminLogout,
  onOpenImageManager,
  getImage,
  onAddInquiry,
  showConsultModal: showConsultModalProp,
  setShowConsultModal: setShowConsultModalProp,
}: EducationPageProps) {
  // Modal states
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [localShowConsultModal, setLocalShowConsultModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isConsultModalOpen = showConsultModalProp !== undefined ? showConsultModalProp : localShowConsultModal;
  const setConsultModalOpen = setShowConsultModalProp || setLocalShowConsultModal;
  const [consultSubmitted, setConsultSubmitted] = useState(false);

  // Form State
  const [consultForm, setConsultForm] = useState({
    name: '',
    phone: '',
    email: '',
    region: '',
    background: '신규 창업 준비',
    message: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConsultForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultForm.name.trim() || !consultForm.phone.trim()) {
      alert('성함과 연락처를 입력해 주세요.');
      return;
    }

    const newInquiry = {
      title: `[드론 세척 교육] ${consultForm.name}님 교육 상담 신청`,
      name: consultForm.name,
      company: consultForm.region ? `[${consultForm.region}] ${consultForm.background}` : consultForm.background,
      phone: consultForm.phone,
      email: consultForm.email || '-',
      serviceType: '드론 세척 전문교육',
      buildingDetails: `지역: ${consultForm.region || '미기재'} | 배경/현재상황: ${consultForm.background} | 상담내용: ${consultForm.message || '교육 과정 및 일정 유선 상담 희망'}`,
      password: '1234',
      requestTest: false,
    };

    onAddInquiry(newInquiry);
    setConsultSubmitted(true);
  };

  const handleCloseConsultModal = () => {
    setConsultModalOpen(false);
    if (consultSubmitted) {
      setConsultSubmitted(false);
      setConsultForm({
        name: '',
        phone: '',
        email: '',
        region: '',
        background: '신규 창업 준비',
        message: '',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[#1d61e8] selection:text-white">
      {/* 1. TOP NOTICE / CONTACT BAR */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-[#1d61e8] text-white text-[10px] font-bold tracking-wider">
              드론 세척 교육
            </span>
            <span className="text-slate-200 font-semibold text-xs sm:text-sm">
              드론 세척 전문교육 · 드론클린프로
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={onNavigateHome}
              className="text-[#4d8eff] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>← 메인 세척 서비스 바로가기</span>
            </button>
            <span className="hidden sm:inline text-slate-600">|</span>
            <a
              href="tel:01085642682"
              className="hidden sm:inline-flex items-center font-bold text-white hover:text-[#4d8eff] transition-colors"
            >
              <span>☎ 교육 직통문의 010-8564-2682</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo with Back/Home indicator (검정 테두리 완전히 삭제된 클린 로고 마크) */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer"
            title="홈페이지 메인으로 이동"
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
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>
            <div>
              <div className="font-black text-base sm:text-xl tracking-tight text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                <span>드론클린프로</span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium tracking-wide">
                드론 세척 전문교육
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <button
              onClick={onNavigateHome}
              className="hover:text-[#1d61e8] transition-colors py-1 cursor-pointer flex items-center gap-1 text-slate-500"
            >
              홈(세척서비스)
            </button>
            <button
              onClick={() => document.getElementById('edu-why')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-[#1d61e8] transition-colors py-1 cursor-pointer"
            >
              교육 소개
            </button>
            <button
              onClick={() => document.getElementById('edu-curriculum')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-[#1d61e8] transition-colors py-1 cursor-pointer"
            >
              교육 과정
            </button>
            <button
              onClick={() => document.getElementById('edu-process')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-[#1d61e8] transition-colors py-1 cursor-pointer"
            >
              진행 절차
            </button>
            <button
              onClick={() => document.getElementById('edu-support')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-[#1d61e8] transition-colors py-1 cursor-pointer"
            >
              사후 지원
            </button>
            <button
              onClick={() => document.getElementById('edu-target')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-[#1d61e8] transition-colors py-1 cursor-pointer"
            >
              교육 대상
            </button>
            <button
              onClick={() => {
                document.getElementById('edu-cta')?.scrollIntoView({ behavior: 'smooth' });
                setConsultModalOpen(true);
              }}
              className="hover:text-[#1d61e8] transition-colors py-1 cursor-pointer text-[#1d61e8] font-bold"
            >
              교육상담
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {isAdminAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenImageManager()}
                  className="px-2.5 py-1.5 rounded border border-slate-300 hover:border-slate-800 bg-white text-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#1d61e8]" />
                  <span className="hidden sm:inline">사진관리</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAdminLogout()}
                  className="px-2 py-1.5 rounded border border-slate-300 hover:border-slate-800 bg-white text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                >
                  로그아웃
                </button>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setConsultModalOpen(true)}
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#1d61e8] hover:bg-[#1550c6] text-white font-bold px-2.5 sm:px-4 py-2 sm:py-2.5 rounded shadow-xs hover:shadow transition-all text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              <span>교육 상담 신청</span>
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

        {/* 모바일 내비게이션 드로어 */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-xl animate-fadeIn">
            <nav className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
              <button
                onClick={() => {
                  onNavigateHome();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between text-[#1d61e8] font-bold"
              >
                <span>← 홈(세척서비스) 메인으로</span>
                <ChevronRight className="w-4 h-4 text-[#1d61e8]" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('edu-why')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>교육 소개</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('edu-curriculum')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>교육 과정</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('edu-process')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>진행 절차</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('edu-support')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>사후 지원</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('edu-target')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>교육 대상</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </nav>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <a
                href="tel:01085642682"
                className="flex-1 py-2.5 px-3 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>교육문의 010-8564-2682</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setConsultModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="py-2.5 px-4 rounded-lg bg-[#1d61e8] text-white text-xs font-bold shadow-xs"
              >
                상담신청
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main>
        {/* =========================================
            1. HERO SECTION
        ========================================= */}
        <section className="relative py-16 lg:py-24 bg-white text-slate-900 border-b border-slate-200 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Column: Headlines & CTAs */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Eyebrow Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#1d61e8] text-xs font-bold tracking-wide">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>드론 세척 전문교육</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>현장 중심 1:1 맞춤교육</span>
                  </div>
                </div>

                {/* Main Title */}
                <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.3] tracking-tight break-keep">
                  드론세척, 장비부터<br />
                  현장ㆍ견적까지<br />
                  <span className="text-[#1d61e8]">직접 배워보세요.</span>
                </h1>

                {/* Sub Description */}
                <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed break-keep">
                  실제 드론 세척 현장에서 사용하는 장비와 작업방식을 바탕으로 장비 세팅부터 세척기술, 현장실습, 견적 및 고객 대응까지 현장에서 바로 활용할 수 있는 실무 중심 교육을 제공합니다.
                </p>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col items-center lg:items-start gap-3">
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => document.getElementById('edu-curriculum')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full sm:w-auto px-6 py-2.5 min-h-[50px] sm:min-h-[52px] rounded bg-slate-900 hover:bg-black text-white text-sm sm:text-base font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>교육과정 확인하기</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <a
                      href="tel:01085642682"
                      className="w-full sm:w-auto px-6 py-2.5 min-h-[50px] sm:min-h-[52px] rounded bg-[#1d61e8] hover:bg-[#1550c6] text-white font-bold transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <PhoneCall className="w-4 h-4 text-white shrink-0" />
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm sm:text-base leading-tight">교육 상담하기</span>
                        <span className="text-xs sm:text-sm font-semibold opacity-95 leading-tight mt-0.5 tracking-wider">
                          010-8564-2682
                        </span>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Bottom Core Points */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-xs sm:text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1d61e8] shrink-0" />
                    <span>실제 세척 현장 경험 기반 교육</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1d61e8] shrink-0" />
                    <span>장비·세척기술·현장실습 중심</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1d61e8] shrink-0" />
                    <span>견적·고객 대응까지 교육</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1d61e8] shrink-0" />
                    <span>교육 후에도 관련 문의 지원</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Clean Professional B2B Highlight Card */}
              <div className="lg:col-span-5">
                <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 md:p-9 shadow-xl border border-slate-800 space-y-5 sm:space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#1d61e8]/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="border-b border-slate-800 pb-4">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-[#4d8eff] uppercase tracking-wider">PRACTICAL EDUCATION</span>
                      <h3 className="text-xl font-black text-white">드론클린프로 전문교육</h3>
                    </div>
                  </div>

                  <div className="space-y-3.5 text-sm">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <Wrench className="w-5 h-5 text-[#4d8eff] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white text-sm">장비 구성 & 세팅</div>
                        <p className="text-xs text-slate-300 mt-0.5">산업용 세척드론, 고압펌프, 고압호스, 노즐 등 장비 세팅</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <Droplets className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white text-sm">세척 기술 & 작업 방법</div>
                        <p className="text-xs text-slate-300 mt-0.5">외벽·태양광·유리창 등 대상별 세척방법과 작업 순서</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                      <Briefcase className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white text-sm">견적 산정 & 현장 운영</div>
                        <p className="text-xs text-slate-300 mt-0.5">현장 실측, 작업비용 산정, 고객 상담 및 작업 협의</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setConsultModalOpen(true)}
                      className="w-full py-3 rounded-lg bg-[#1d61e8] hover:bg-[#1550c6] text-white font-bold text-sm transition-colors flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      <span>교육 상담 신청</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================
            WHY US SECTION (왜 드론클린프로 교육인가?)
        ========================================= */}
        <section id="edu-why" className="py-16 sm:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold text-[#1d61e8] uppercase tracking-wider">
                WHY DRONE CLEAN PRO EDUCATION
              </span>
              <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight break-keep">
                왜 드론클린프로에서<br />
                배워야 할까요?
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed break-keep">
                실제 드론 세척 현장을 운영하며 <br className="sm:hidden" />
                쌓은 경험을 바탕으로 교육합니다.<br />
                장비 세팅부터 세척 방법, 현장 작업과 견적까지 <br className="sm:hidden" />
                실제 작업에 필요한 내용을 직접 알려드립니다.
              </p>
            </div>

            {/* 3 Core Advantage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Card 1 */}
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-xs hover:border-[#1d61e8] hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1d61e8] flex items-center justify-center font-black">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-snug">
                    실제 세척 현장에서 사용하는<br />
                    장비와 작업방식
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
{`실제 작업에 사용하는 장비를 직접 확인하고
장비 구성과 세팅 방법을 익힙니다.`}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-bold text-[#1d61e8]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>장비 구성 및 세팅 방법</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-xs hover:border-[#1d61e8] hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-snug">
                    외벽·태양광·유리창 등<br />
                    대상별 세척방법
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
{`대상과 오염 상태, 작업환경에 따라
적절한 세척방법과 작업 순서를 익힙니다.`}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>대상별 세척방법 및 작업 순서</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-xs hover:border-[#1d61e8] hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-snug">
                    견적부터 고객 대응까지<br />
                    현장 운영 교육
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
{`현장 실측과 작업비용 산정부터
고객 상담과 작업 협의까지 필요한 내용을 함께 다룹니다.`}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-bold text-indigo-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>현장 실측·견적 산정·고객 상담</span>
                </div>
              </div>

            </div>

            {/* Differentiation Statement Callout Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-8 rounded-2xl shadow-md border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#1d61e8] text-white text-xs font-bold">
                  <span>드론클린프로만의 차별화</span>
                </div>
                <h4 className="text-base sm:text-xl font-black text-white leading-snug break-keep">
                  “단순한 비행 교육이 아닙니다. 실제 드론 세척 현장에서 사용하는 방법을 배웁니다.”
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl break-keep">
                  실제 현장에서 사용하는 장비와 작업방법부터 세척, 현장 운영, 견적까지 직접 경험해보세요.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                <a
                  href="https://www.youtube.com/@%EB%93%9C%EB%A1%A0%ED%81%B4%EB%A6%B0%ED%94%84%EB%A1%9C/shorts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>실제 작업 영상 보기</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================
            2. 교육과정 SECTION
        ========================================= */}
        <section id="edu-curriculum" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold text-[#1d61e8] uppercase tracking-wider">
                CURRICULUM BREAKDOWN
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                무엇을 배우나요?
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed whitespace-pre-line">
{`장비 이해부터 실제 세척, 현장 운영과 견적까지
드론 세척 작업에 필요한 과정을 단계별로 배웁니다.`}
              </p>
            </div>

            {/* 8 Brief Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* 01 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-[#1d61e8] transition-all space-y-2.5">
                <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 01</span>
                <h3 className="text-lg font-black text-slate-900">
                  드론 세척의 이해
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  드론을 활용한 세척 작업의 기본 구조와 운용방식
                </p>
              </div>

              {/* 02 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-[#1d61e8] transition-all space-y-2.5">
                <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 02</span>
                <h3 className="text-lg font-black text-slate-900">
                  세척 장비 구성
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  세척드론, 고압세척기, 호스, 노즐 등 주요 장비 이해
                </p>
              </div>

              {/* 03 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-[#1d61e8] transition-all space-y-2.5">
                <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 03</span>
                <h3 className="text-lg font-black text-slate-900">
                  세척 원리와 방법
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  오염 상태에 따른 세척방법과 세제·폼·고압수·퓨어워터 활용
                </p>
              </div>

              {/* 04 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-[#1d61e8] transition-all space-y-2.5">
                <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 04</span>
                <h3 className="text-lg font-black text-slate-900">
                  실제 세척 실습
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  장비 세팅부터 드론을 활용한 실제 세척작업
                </p>
              </div>

              {/* 05 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-[#1d61e8] transition-all space-y-2.5">
                <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 05</span>
                <h3 className="text-lg font-black text-slate-900">
                  대상별 세척방법
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  건물 외벽·태양광·유리창 등 대상별 작업방법
                </p>
              </div>

              {/* 06 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-[#1d61e8] transition-all space-y-2.5">
                <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 06</span>
                <h3 className="text-lg font-black text-slate-900">
                  현장 운영 및 안전
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  현장 확인, 작업 준비, 장비 운용 및 안전관리
                </p>
              </div>

              {/* 07 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-[#1d61e8] transition-all space-y-2.5">
                <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 07</span>
                <h3 className="text-lg font-black text-slate-900">
                  드론 운용 관련 행정
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  기체 신고, 비행 관련 절차 등 드론 운용에 필요한 기본 행정
                </p>
              </div>

              {/* 08 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-[#1d61e8] transition-all space-y-2.5">
                <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 08</span>
                <h3 className="text-lg font-black text-slate-900">
                  견적 및 고객 대응
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  현장 확인, 작업비용 산정, 견적 작성 및 고객 상담
                </p>
              </div>

            </div>

            {/* Modal Open Button */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setShowCurriculumModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded bg-white hover:bg-slate-100 text-slate-900 font-bold border border-slate-300 shadow-xs hover:border-slate-800 transition-all text-sm sm:text-base cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#1d61e8]" />
                <span>전체 교육과정 자세히 보기</span>
              </button>
            </div>

          </div>
        </section>

        {/* =========================================
            5. 교육 진행 방식 SECTION
        ========================================= */}
        <section id="edu-process" className="py-16 sm:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold text-[#1d61e8] uppercase tracking-wider">
                TRAINING FLOW & TIMELINE
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                이론부터 실제 작업까지
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                단계별 체계적인 실무 흐름에 따라 이론 습득에서 실전 현장 대응까지 자연스럽게 연결됩니다.
              </p>
            </div>

            {/* 5-Step Process Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              
              {/* STEP 01 */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-xs relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded bg-slate-900 text-white">
                    STEP 01
                  </span>
                  <span className="text-xs text-slate-600 font-bold">1단계</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  이론 및 <br className="hidden sm:inline" />
                  장비 이해
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  장비 사양 및 작동 원리 습득
                </p>
              </div>

              {/* STEP 02 */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-xs relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded bg-slate-900 text-white">
                    STEP 02
                  </span>
                  <span className="text-xs text-slate-600 font-bold">2단계</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  세척기술 <br className="hidden sm:inline" />
                  학습
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  오염도별 약품 및 수압 조건
                </p>
              </div>

              {/* STEP 03 */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-xs relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded bg-[#1d61e8] text-white">
                    STEP 03
                  </span>
                  <span className="text-xs text-[#1d61e8] font-bold">3단계</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  장비 세팅 <br className="hidden sm:inline" />
                  및 실습
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  현장 장비 결착 및 기체 실습
                </p>
              </div>

              {/* STEP 04 */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-xs relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded bg-slate-900 text-white">
                    STEP 04
                  </span>
                  <span className="text-xs text-slate-600 font-bold">4단계</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  실제 작업 <br className="hidden sm:inline" />
                  적용
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  시뮬레이션 및 실전 세척 시공
                </p>
              </div>

              {/* STEP 05 */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-xs relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded bg-slate-900 text-white">
                    STEP 05
                  </span>
                  <span className="text-xs text-slate-600 font-bold">5단계</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  견적 작성 및 <br className="hidden sm:inline" />
                  현장 대응
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  견적서 작성 및 고객 상담
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================
            6. 교육 후에도 함께합니다 SECTION
        ========================================= */}
        <section id="edu-support" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8 text-center sm:text-left">
              
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#1d61e8] uppercase tracking-wider">
                  CONTINUOUS PRACTITIONER SUPPORT
                </span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight break-keep">
                  교육이 끝났다고<br />
                  끝이 아닙니다.
                </h2>
              </div>

              <div className="space-y-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                <p>
                  실제 세척 현장에 나서면 교육에서 다루지 않았던 새로운 작업환경이나 예상하지 못한 상황이 발생할 수 있습니다.
                </p>
                <p>
                  교육 이후에도 궁금한 내용이나 어려운 현장이 생겼을 때
                  <br className="hidden sm:inline" />
                  <strong className="text-slate-900 font-bold">
                    드론클린프로에 문의하고 함께 해결방법을 찾아갈 수 있도록 지원합니다.
                  </strong>
                </p>
              </div>

              {/* Highlight Callout Box */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border-l-4 border-l-[#1d61e8] border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[#1d61e8] font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>실무자 파트너십 안내</span>
                </div>
                <p className="text-lg sm:text-xl font-black text-slate-900">
                  “교육 이후에도 필요한 경우 문의하고 함께 해결할 수 있습니다.”
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  장비 문제, 새로운 현장, 작업 중 발생한 문제 등 교육 이후 궁금한 사항이 있을 경우 언제든 문의하실 수 있습니다.
                </p>
              </div>

            </div>
          </div>
        </section>



        {/* =========================================
            8. 교육 대상 SECTION
        ========================================= */}
        <section id="edu-target" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold text-[#1d61e8] uppercase tracking-wider">
                TARGET AUDIENCE
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight break-keep">
                이런 분들을 위한 교육입니다.
              </h2>
            </div>

            {/* 4 Items (Concise Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5">
                <CheckCircle2 className="w-5 h-5 text-[#1d61e8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    드론 세척을 새롭게 시작하고 싶은 분
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5">
                <CheckCircle2 className="w-5 h-5 text-[#1d61e8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    기존 사업에 드론 세척을 추가하고 싶은 분
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5">
                <CheckCircle2 className="w-5 h-5 text-[#1d61e8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    세척드론 및 장비 구성을 배우고 싶은 분
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5">
                <CheckCircle2 className="w-5 h-5 text-[#1d61e8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    실제 현장에서 사용하는 세척방법을 배우고 싶은 분
                  </h3>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================
            9. 교육 전 확인사항 SECTION
        ========================================= */}
        {/* =========================================
            9. 교육 전 확인사항 SECTION
        ========================================= */}
        <section className="py-8 sm:py-10 bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs sm:text-sm leading-relaxed flex items-start gap-3 sm:gap-3.5 shadow-xs">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <span className="font-black text-slate-900 text-sm sm:text-base block">[교육 전 필수 확인사항]</span>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm break-keep">
                  본 교육은 드론 세척 작업에 필요한 장비와 작업방법을 교육하는 과정입니다. 교육 후 매출이나 수주를 보장하지 않으며, 드론 관련 신고·승인 및 행정절차는 개인의 기체와 작업조건에 따라 별도로 확인이 필요합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            10. 마지막 CTA SECTION
        ========================================= */}
        <section id="edu-cta" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
            
            <div className="max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold text-[#4d8eff] uppercase tracking-wider">
                GET STARTED TODAY
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                드론 세척 교육을 고민하고 있다면
              </h2>
              <p className="text-lg sm:text-xl text-slate-300 font-medium">
                실제 현장에서 사용하는 기술과 경험을 배워보세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setConsultModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-[#1d61e8] hover:bg-[#1550c6] text-white text-base font-black transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5" />
                <span>교육 상담 신청</span>
              </button>

              <a
                href="tel:01085642682"
                className="w-full sm:w-auto px-6 py-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm sm:text-base font-bold transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>전화 직통 상담 : 010-8564-2682</span>
              </a>
            </div>

            <p className="text-xs text-slate-500">
              평일 및 주말 유선 상담 가능
            </p>

          </div>
        </section>
      </main>

      {/* =========================================
          FOOTER
      ========================================= */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          
          {/* Company info */}
          <div className="md:col-span-6 space-y-3">
            <div className="font-black text-base text-white flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center overflow-hidden shrink-0 border-0">
                <img
                  src={getImage('logo')}
                  alt="드론클린프로 로고"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>
              <span>드론클린프로 (DRONE CLEANPRO)</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">
              건물위생관리업 기반 산업용 드론 세척 서비스 및 드론 세척 전문교육 과정을 운영합니다.
            </p>
            <div className="pt-2 text-slate-400 space-y-1">
              <div>주소 : 경기도 오산시 오산로 190번길 42, 2층 2030호</div>
              <div>대표전화 : 010-8564-2682 | 문의 이메일 : dcpro25@naver.com</div>
              <div>대표 : 이빛나 | 사업자등록번호 : 110-35-78490</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <div className="font-bold text-white text-sm">교육 섹션 바로가기</div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => document.getElementById('edu-why')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  • 교육 소개
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('edu-curriculum')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  • 교육 과정
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('edu-process')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  • 진행 절차
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('edu-support')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  • 사후 지원
                </button>
              </li>

              <li>
                <button
                  onClick={() => document.getElementById('edu-target')?.scrollIntoView({ behavior: 'smooth' })}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  • 교육 대상
                </button>
              </li>
            </ul>
          </div>

          {/* Main Site Links */}
          <div className="md:col-span-3 space-y-2">
            <div className="font-bold text-white text-sm">관련 사이트</div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={onNavigateHome}
                  className="text-[#4d8eff] hover:underline font-bold transition-colors cursor-pointer"
                >
                  • 메인 세척 서비스 홈페이지 →
                </button>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/channel/UC7yiKzr0QBoRnTGAK8s8-nw?si=ji1Q0epx-Noy2wy2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>• 공식 유튜브 채널 (작업 영상)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenAdminLogin}
                  className="hover:text-slate-300 text-slate-500 cursor-pointer pt-2 block"
                >
                  관리자 로그인
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-slate-400 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 DroneCleanPro. All rights reserved.</p>
          <p>드론 세척 전문교육 안내 페이지</p>
        </div>
      </footer>

      {/* =========================================
          MODAL 1: 전체 교육과정 자세히 보기 팝업 (모달)
      ========================================= */}
      {showCurriculumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowCurriculumModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1.5 pr-8">
              <span className="text-xs font-bold text-[#1d61e8] uppercase tracking-wider">
                CURRICULUM BREAKDOWN
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                전체 교육과정 상세 커리큘럼
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                장비 이해부터 실제 세척, 현장 운영과 견적까지 드론 세척 작업에 필요한 과정을 단계별로 배웁니다.
              </p>
            </div>

            {/* 8 Module Detailed Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-sm">
              {/* 01 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 01</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">01. 드론 세척의 이해</h4>
                <p className="text-xs text-slate-600 font-medium">
                  드론을 활용한 세척 작업의 기본 구조와 운용방식
                </p>
                <ul className="text-xs text-slate-500 space-y-1 pl-4 list-disc pt-1">
                  <li>세척드론 비행 메커니즘과 작업 원리</li>
                  <li>작업 환경 및 고소 작업 안전성 이해</li>
                </ul>
              </div>

              {/* 02 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 02</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">02. 세척 장비 구성</h4>
                <p className="text-xs text-slate-600 font-medium">
                  세척드론, 고압세척기, 호스, 노즐 등 주요 장비 이해
                </p>
                <ul className="text-xs text-slate-500 space-y-1 pl-4 list-disc pt-1">
                  <li>지상 펌프 시스템 및 고압수 공급 라인 구성</li>
                  <li>노즐 종류별 특성 및 작업 환경별 장비 세팅</li>
                </ul>
              </div>

              {/* 03 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 03</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">03. 세척 원리와 방법</h4>
                <p className="text-xs text-slate-600 font-medium">
                  오염 상태에 따른 세척방법과 세제·폼·고압수·퓨어워터 활용
                </p>
                <ul className="text-xs text-slate-500 space-y-1 pl-4 list-disc pt-1">
                  <li>오염 상태별 맞춤형 세척방법 및 수압 제어</li>
                  <li>퓨어워터(순수수) 및 친환경 세제 활용 기준</li>
                </ul>
              </div>

              {/* 04 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 04</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">04. 실제 세척 실습</h4>
                <p className="text-xs text-slate-600 font-medium">
                  장비 세팅부터 드론을 활용한 실제 세척작업
                </p>
                <ul className="text-xs text-slate-500 space-y-1 pl-4 list-disc pt-1">
                  <li>고압수 분사 실습 및 기체 비행 안정성 유지</li>
                  <li>비행 거리와 분사 각도에 따른 균일한 세척 마감</li>
                </ul>
              </div>

              {/* 05 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 05</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">05. 대상별 세척방법</h4>
                <p className="text-xs text-slate-600 font-medium">
                  건물 외벽·태양광·유리창 등 대상별 작업방법
                </p>
                <ul className="text-xs text-slate-500 space-y-1 pl-4 list-disc pt-1">
                  <li>건물 외벽(석재·복합패널) 세척 기법</li>
                  <li>태양광 패널 손상 방지 및 유리창 퓨어워터 마감</li>
                </ul>
              </div>

              {/* 06 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 06</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">06. 현장 운영 및 안전</h4>
                <p className="text-xs text-slate-600 font-medium">
                  현장 확인, 작업 준비, 장비 운용 및 안전관리
                </p>
                <ul className="text-xs text-slate-500 space-y-1 pl-4 list-disc pt-1">
                  <li>작업 구간 설정 및 지상 안전 통제선 운영</li>
                  <li>돌풍·수압 변화 등 현장 돌발상황 대처 프로세스</li>
                </ul>
              </div>

              {/* 07 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 07</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">07. 드론 운용 관련 행정</h4>
                <p className="text-xs text-slate-600 font-medium">
                  기체 신고, 비행 관련 절차 등 드론 운용에 필요한 기본 행정
                </p>
                <ul className="text-xs text-slate-500 space-y-1 pl-4 list-disc pt-1">
                  <li>초경량비행장치 기체 신고 및 비행 승인 절차</li>
                  <li>작업 전 필수 법적 점검 사항 및 행정 가이드</li>
                </ul>
              </div>

              {/* 08 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#1d61e8] tracking-wider">MODULE 08</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">08. 견적 및 고객 대응</h4>
                <p className="text-xs text-slate-600 font-medium">
                  현장 확인, 작업비용 산정, 견적 작성 및 고객 상담
                </p>
                <ul className="text-xs text-slate-500 space-y-1 pl-4 list-disc pt-1">
                  <li>현장 실측 및 작업 공수에 따른 비용 산출 실습</li>
                  <li>견적서 작성, 고객 상담 및 작업 협의</li>
                </ul>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium">
              ※ 교육생의 기존 비행 경력 및 장비 보유 상태에 따라 1:1 맞춤으로 세부 교육 비중이 조율됩니다.
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCurriculumModal(false)}
                className="px-4 py-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCurriculumModal(false);
                  setConsultModalOpen(true);
                }}
                className="px-5 py-2.5 rounded bg-[#1d61e8] hover:bg-[#1550c6] text-white font-bold text-xs sm:text-sm cursor-pointer flex items-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>교육 상담 신청하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL 2: 교육 상담 신청 모달
      ========================================= */}
      {isConsultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseConsultModal}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {consultSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  교육 상담 신청이 완료되었습니다
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  작성해주신 연락처로 담당 총괄이사가 확인 후<br />
                  빠른 시일 내에 상세 일정과 상담 내용을 안내해 드리겠습니다.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div><strong>담당자 :</strong> 총괄이사 조영수</div>
                  <div><strong>직통 문의 :</strong> 010-8564-2682</div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseConsultModal}
                  className="w-full py-3 rounded-lg bg-[#1d61e8] text-white font-bold text-sm hover:bg-[#1550c6] transition-colors cursor-pointer"
                >
                  확인
                </button>
              </div>
            ) : (
              <form onSubmit={handleConsultSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#1d61e8] uppercase tracking-wider">
                    CONSULTATION REQUEST
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">
                    드론 세척 실무교육 상담 신청
                  </h3>
                  <p className="text-xs text-slate-500">
                    상담 내용을 남겨주시면 담당자가 직접 연락드립니다.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      성함 / 담당자명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={consultForm.name}
                      onChange={handleFormChange}
                      placeholder="예: 홍길동"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1d61e8] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={consultForm.phone}
                      onChange={handleFormChange}
                      placeholder="예: 010-1234-5678"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1d61e8] text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        활동 지역
                      </label>
                      <input
                        type="text"
                        name="region"
                        value={consultForm.region}
                        onChange={handleFormChange}
                        placeholder="예: 경기/서울/충청"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1d61e8] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        현재 상황
                      </label>
                      <select
                        name="background"
                        value={consultForm.background}
                        onChange={handleFormChange}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1d61e8] text-sm bg-white"
                      >
                        <option value="신규 창업 준비">신규 창업 준비</option>
                        <option value="기존 청소/시설관리업 운영">기존 청소/시설관리업 운영</option>
                        <option value="드론 조종사/자격증 보유">드론 조종사/자격증 보유</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      이메일 (선택)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={consultForm.email}
                      onChange={handleFormChange}
                      placeholder="example@naver.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1d61e8] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      궁금한 사항 / 상담 내용
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={consultForm.message}
                      onChange={handleFormChange}
                      placeholder="보유 기체 여부, 희망 일정, 궁금하신 점을 자유롭게 적어주세요."
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#1d61e8] text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-lg bg-[#1d61e8] hover:bg-[#1550c6] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>상담 신청서 제출하기</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    급한 상담은 직통 전화(010-8564-2682)로 문의하시면 더 빠릅니다.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
