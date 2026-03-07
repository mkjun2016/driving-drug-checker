import React, { useState, useMemo, useEffect } from 'react';
import { Search, AlertTriangle, AlertCircle, Info, Shield, Car, Pill, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

// 레벨별 설정
const levelConfig = {
  "운전금지": { 
    color: "bg-red-500", 
    lightBg: "bg-red-50", 
    border: "border-red-200",
    text: "text-red-700",
    icon: AlertTriangle,
    description: "복용 후 절대 운전 금지",
    penalty: "5년 이하 징역 / 2천만원 이하 벌금"
  },
  "운전위험": { 
    color: "bg-orange-500", 
    lightBg: "bg-orange-50", 
    border: "border-orange-200",
    text: "text-orange-700",
    icon: AlertCircle,
    description: "복용 후 4-6시간 운전 금지",
    penalty: "사고 시 가중처벌"
  },
  "운전주의": { 
    color: "bg-yellow-500", 
    lightBg: "bg-yellow-50", 
    border: "border-yellow-200",
    text: "text-yellow-700",
    icon: Info,
    description: "졸음/어지럼 시 운전 자제",
    penalty: "증상 발현 시 처벌 대상"
  },
  "단순주의": { 
    color: "bg-blue-500", 
    lightBg: "bg-blue-50", 
    border: "border-blue-200",
    text: "text-blue-700",
    icon: Shield,
    description: "일반적으로 안전, 개인차 주의",
    penalty: "증상 발현 시 처벌 대상"
  }
};

export default function App() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  // CSV 데이터 불러오기
  useEffect(() => {
    fetch('/drugs.csv')
      .then(res => res.text())
      .then(text => {
        const lines = text.trim().split('\n');
        
        const data = lines.slice(1).map(line => {
          // CSV 파싱 (쉼표가 값에 포함될 수 있으므로 처리)
          const values = [];
          let current = '';
          let inQuotes = false;
          
          for (let char of line) {
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());
          
          return {
            name: values[0] || '',
            company: values[1] || '',
            type: values[2] || '',
            level: values[3] || '',
            ingredient: values[4] || '',
            category: values[5] || ''
          };
        });
        
        setDrugs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('CSV 로드 실패:', err);
        setLoading(false);
      });
  }, []);

  // 검색 필터링
  const filteredDrugs = useMemo(() => {
    let results = drugs;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(drug => 
        drug.name.toLowerCase().includes(term) ||
        drug.ingredient.toLowerCase().includes(term) ||
        drug.category.toLowerCase().includes(term) ||
        drug.company.toLowerCase().includes(term)
      );
    }
    
    if (selectedLevel !== 'all') {
      results = results.filter(drug => drug.level === selectedLevel);
    }
    
    return results.slice(0, 100); // 최대 100개만 표시 (성능)
  }, [drugs, searchTerm, selectedLevel]);

  // 통계
  const stats = useMemo(() => ({
    total: drugs.length,
    운전금지: drugs.filter(d => d.level === '운전금지').length,
    운전위험: drugs.filter(d => d.level === '운전위험').length,
    운전주의: drugs.filter(d => d.level === '운전주의').length,
    단순주의: drugs.filter(d => d.level === '단순주의').length,
  }), [drugs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-white">약물 데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                운전금지 약물 검색
              </h1>
              <p className="text-red-100 text-sm font-medium">
                2026년 4월 시행 개정 도로교통법 대응 | 총 {stats.total.toLocaleString()}건
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 경고 배너 */}
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 rounded-2xl p-4 backdrop-blur">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-red-300 mb-1">⚠️ 2026년 4월 2일부터 처벌 강화</h2>
              <p className="text-red-200/80 text-sm leading-relaxed">
                감기약·수면제 복용 후 운전도 <span className="font-bold text-white">만취 음주운전과 동일</span> 처벌!
                <br />
                <span className="text-red-300">최대 5년 징역 또는 2천만원 벌금</span> | 검사 거부 시에도 동일 처벌
              </p>
            </div>
          </div>
        </div>

        {/* 검색창 */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="약 이름 검색 (예: 타이레놀, 판콜, 지르텍...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-800/80 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg backdrop-blur"
          />
        </div>

        {/* 필터 버튼 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLevel('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              selectedLevel === 'all'
                ? 'bg-white text-slate-900'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            전체 ({stats.total.toLocaleString()})
          </button>
          {Object.entries(levelConfig).map(([level, config]) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                selectedLevel === level
                  ? `${config.color} text-white`
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <config.icon className="w-4 h-4" />
              {level} ({stats[level]?.toLocaleString() || 0})
            </button>
          ))}
        </div>

        {/* 정보 토글 */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all"
        >
          <span className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            등급별 상세 안내 및 출처
          </span>
          {showInfo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showInfo && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4 backdrop-blur">
            <h3 className="font-bold text-white text-lg mb-3">📋 등급별 기준</h3>
            {Object.entries(levelConfig).map(([level, config]) => (
              <div key={level} className={`p-3 rounded-xl ${config.lightBg} ${config.border} border`}>
                <div className="flex items-center gap-2 mb-1">
                  <config.icon className={`w-5 h-5 ${config.text}`} />
                  <span className={`font-bold ${config.text}`}>{level}</span>
                </div>
                <p className={`text-sm ${config.text} opacity-80`}>{config.description}</p>
                <p className="text-xs mt-1 text-slate-600">처벌: {config.penalty}</p>
              </div>
            ))}
            
            <div className="border-t border-slate-600 pt-4 mt-4">
              <h4 className="font-bold text-white mb-2">📚 데이터 출처</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• 건강보험심사평가원 약가마스터 (2025.10.31 기준)</li>
                <li>• 대한약사회 운전주의 의약품 386개 성분 분류 (2026.02)</li>
                <li>• 도로교통법 제44조, 제45조 (2026.04.02 시행)</li>
                <li>• 마약류 관리에 관한 법률</li>
              </ul>
              <p className="text-xs text-slate-500 mt-3">
                ⚠️ 본 자료는 참고용이며, 정확한 판단은 의사·약사와 상담하세요.
              </p>
            </div>
          </div>
        )}

        {/* 검색 결과 */}
        <div className="space-y-3">
          {searchTerm && (
            <p className="text-slate-400 text-sm">
              "{searchTerm}" 검색 결과: {filteredDrugs.length}건
              {filteredDrugs.length >= 100 && " (최대 100개 표시)"}
            </p>
          )}
          
          {!searchTerm && selectedLevel === 'all' ? (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>약 이름을 검색하거나</p>
              <p className="text-sm mt-1">위 등급 버튼을 눌러 확인하세요</p>
            </div>
          ) : filteredDrugs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>검색 결과가 없습니다.</p>
              <p className="text-sm mt-1">다른 검색어를 시도해보세요.</p>
            </div>
          ) : (
            filteredDrugs.map((drug, index) => {
              const config = levelConfig[drug.level] || levelConfig["단순주의"];
              const IconComponent = config.icon;
              const isExpanded = expandedCard === index;
              
              return (
                <div
                  key={index}
                  onClick={() => setExpandedCard(isExpanded ? null : index)}
                  className={`${config.lightBg} ${config.border} border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 ${config.color} rounded-xl flex-shrink-0`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-bold ${config.text} text-lg break-words`}>
                          {drug.name}
                        </h3>
                        <p className="text-slate-600 text-sm">
                          {drug.category} | {drug.type || '분류없음'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 ${config.color} text-white text-sm font-bold rounded-full flex-shrink-0 ml-2`}>
                      {drug.level}
                    </span>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                      <div>
                        <span className="text-slate-500 text-sm">제조사:</span>
                        <span className={`ml-2 ${config.text}`}>{drug.company}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-sm">관련 성분:</span>
                        <span className={`ml-2 font-medium ${config.text}`}>{drug.ingredient}</span>
                      </div>
                      <div className={`p-3 rounded-lg ${config.color}/10 mt-3`}>
                        <p className={`text-sm font-medium ${config.text}`}>
                          💊 {config.description}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          위반 시: {config.penalty}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 하단 안내 */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 mt-8">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            안전 운전 체크리스트
          </h3>
          <ul className="text-slate-300 text-sm space-y-2">
            <li>✅ 약 복용 전 의사·약사에게 "운전해도 되나요?" 확인</li>
            <li>✅ 약봉투의 "졸음 주의" 문구 꼭 확인</li>
            <li>✅ 수면제·안정제는 복용 후 최소 6시간 이상 운전 금지</li>
            <li>✅ 졸림·어지럼증 느껴지면 절대 운전하지 않기</li>
            <li>✅ 복용 기록 보관 (사고 시 소명 자료)</li>
          </ul>
        </div>

        {/* Footer */}
        <footer className="text-center text-slate-500 text-xs py-6 space-y-1">
          <p>본 서비스는 참고용이며, 법적 효력이 없습니다.</p>
          <p>정확한 판단은 의료 전문가와 상담하세요.</p>
          <p className="pt-2">
            데이터 출처: 건강보험심사평가원, 대한약사회, 식품의약품안전처
          </p>
          <p>마지막 업데이트: 2025.10.31</p>
        </footer>
      </main>
    </div>
  );
}
