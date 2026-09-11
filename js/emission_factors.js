// ============================================================================
// MICE ESG 플랫폼 — 중앙 배출계수 데이터베이스 (emission_factors.js)
// NZCE 9대 배출원 산정 방식 가이드 기반
// ============================================================================

(function() {
  'use strict';

  // ─── 배출계수 프리셋 정의 ──────────────────────────────────────────────
  const EF_PRESETS = {
    kr_default: {
      id: 'kr_default',
      name: '한국 기본 (환경부 2024)',
      shortName: '한국 기본',
      description: '환경부 국가 온실가스 인벤토리 기반 최신 배출계수',
      icon: '🇰🇷',
      year: 2024,
      region: '대한민국',
      source: '환경부 온실가스 종합정보센터'
    },
    defra_2024: {
      id: 'defra_2024',
      name: 'DEFRA 2024 (UK)',
      shortName: 'DEFRA 2024',
      description: '영국 환경식품농림부 GHG 변환계수 2024',
      icon: '🇬🇧',
      year: 2024,
      region: 'United Kingdom',
      source: 'UK DEFRA/BEIS'
    },
    epa_2024: {
      id: 'epa_2024',
      name: 'EPA 2024 (US)',
      shortName: 'EPA 2024',
      description: '미국 환경보호청 배출계수 2024',
      icon: '🇺🇸',
      year: 2024,
      region: 'United States',
      source: 'US EPA'
    },
    custom: {
      id: 'custom',
      name: '사용자 정의',
      shortName: '커스텀',
      description: '개별 배출계수를 직접 설정합니다',
      icon: '⚙️',
      year: null,
      region: '사용자 정의',
      source: '사용자 입력'
    }
  };

  // ─── 배출계수 데이터베이스 ──────────────────────────────────────────────
  const EF_DATABASE = {

    // ═══ NZCE Category 7: 에너지 (Energy) ═══
    energy: {
      label: '에너지',
      nzceCategory: 7,
      items: {
        electricity_grid: {
          label: '전력 (전력계통)',
          scope: 2,
          unit: 'kgCO2e/kWh',
          description: '구매 전력의 위치기반 배출계수',
          formula: 'GHG = 전력소비량(kWh) × 전력계통 배출계수(kgCO2e/kWh)',
          values: {
            kr_default: { value: 0.4594, note: '2024 국가 전력계통 평균' },
            defra_2024: { value: 0.2070, note: 'UK grid average 2024' },
            epa_2024:   { value: 0.3710, note: 'US national average 2024' }
          }
        },
        diesel_generator: {
          label: '경유 발전기',
          scope: 1,
          unit: 'kgCO2e/L',
          description: '디젤 발전기의 연료 연소 배출계수',
          formula: 'GHG = 경유 소비량(L) × 연소 배출계수(kgCO2e/L)',
          values: {
            kr_default: { value: 2.6058, note: '국가 인벤토리 경유 연소' },
            defra_2024: { value: 2.5568, note: 'DEFRA diesel combustion' },
            epa_2024:   { value: 2.6813, note: 'EPA diesel combustion' }
          }
        },
        city_gas: {
          label: '도시가스 (LNG)',
          scope: 1,
          unit: 'kgCO2e/Nm³',
          description: '난방용 도시가스 연소 배출계수',
          formula: 'GHG = 도시가스 사용량(Nm³) × 연소 배출계수(kgCO2e/Nm³)',
          values: {
            kr_default: { value: 2.176, note: '국가 인벤토리 LNG 연소' },
            defra_2024: { value: 2.021, note: 'DEFRA natural gas' },
            epa_2024:   { value: 2.050, note: 'EPA natural gas' }
          }
        },
        td_loss: {
          label: '송배전 손실',
          scope: 3,
          unit: 'kgCO2e/kWh',
          description: '전력 송배전 과정의 손실 배출계수',
          formula: 'GHG = 전력소비량(kWh) × 송배전 손실 계수(kgCO2e/kWh)',
          values: {
            kr_default: { value: 0.0192, note: '한국 T&D loss factor' },
            defra_2024: { value: 0.0188, note: 'UK T&D losses' },
            epa_2024:   { value: 0.0220, note: 'US T&D losses' }
          }
        }
      }
    },

    // ═══ NZCE Category 4/5: 교통 (Travel & Local Transport) ═══
    transport: {
      label: '교통·이동',
      nzceCategory: '4/5',
      items: {
        car_avg: {
          label: '승용차 (평균)',
          scope: 3,
          unit: 'gCO2e/km',
          description: '승용차 1km 주행 시 배출량',
          formula: 'GHG = 이동거리(km) × 배출계수(gCO2e/km)',
          values: {
            kr_default: { value: 160, note: '한국 승용차 평균 (1400cc 기준)' },
            defra_2024: { value: 170, note: 'DEFRA average car' },
            epa_2024:   { value: 181, note: 'EPA average passenger car' }
          }
        },
        bus_per_passenger: {
          label: '버스 (인당)',
          scope: 3,
          unit: 'gCO2e/passenger·km',
          description: '버스 탑승 시 1인·km당 배출량',
          formula: 'GHG = 이동거리(km) × 인원 × 배출계수(gCO2e/passenger·km)',
          values: {
            kr_default: { value: 40, note: '20인 탑승 기준 시내버스' },
            defra_2024: { value: 35, note: 'DEFRA local bus per passenger' },
            epa_2024:   { value: 42, note: 'EPA transit bus per passenger' }
          }
        },
        shuttle_reduction: {
          label: '셔틀 전환 감축량',
          scope: 3,
          unit: 'gCO2e/passenger·km',
          description: '승용차 대비 셔틀버스 전환 시 감축량',
          formula: '감축량 = 이동거리 × 인원 × (승용차 계수 - 버스 계수)',
          values: {
            kr_default: { value: 120, note: '160 - 40 = 120 gCO2e 감축/p·km' },
            defra_2024: { value: 135, note: '170 - 35 = 135 gCO2e 감축/p·km' },
            epa_2024:   { value: 139, note: '181 - 42 = 139 gCO2e 감축/p·km' }
          }
        },
        air_domestic: {
          label: '국내선 항공',
          scope: 3,
          unit: 'kgCO2e/passenger·km',
          description: '국내선 항공 1인·km당 배출량',
          formula: 'GHG = 비행거리(km) × 인원 × 배출계수',
          values: {
            kr_default: { value: 0.176, note: '한국교통연구원' },
            defra_2024: { value: 0.246, note: 'DEFRA domestic flights' },
            epa_2024:   { value: 0.225, note: 'EPA short-haul flights' }
          }
        },
        ktx: {
          label: 'KTX/고속철도',
          scope: 3,
          unit: 'gCO2e/passenger·km',
          description: '고속철도 1인·km당 배출량',
          formula: 'GHG = 이동거리(km) × 인원 × 배출계수',
          values: {
            kr_default: { value: 12, note: '한국철도공사 KTX 평균 (0.012 kg)' },
            defra_2024: { value: 6, note: 'DEFRA national rail' },
            epa_2024:   { value: 14, note: 'EPA intercity rail' }
          }
        },
        rail_general: {
          label: '일반철도 (ITX/무궁화)',
          scope: 3,
          unit: 'kgCO2e/passenger·km',
          description: '일반 여객철도 1인·km당 배출량',
          formula: 'GHG = 이동거리(km) × 인원 × 배출계수',
          values: {
            kr_default: { value: 0.028, note: '한국철도공사 일반철도 평균' },
            defra_2024: { value: 0.035, note: 'DEFRA regional rail' },
            epa_2024:   { value: 0.038, note: 'EPA commuter rail' }
          }
        },
        air_short_haul: {
          label: '단거리 국제선 항공 (500~3,700km)',
          scope: 3,
          unit: 'kgCO2e/passenger·km',
          description: '단거리 국제선 항공 이코노미 기준 배출량 (동아시아)',
          formula: 'GHG = 비행거리(km) × 인원 × 배출계수 × 좌석승수 (× RF승수)',
          values: {
            kr_default: { value: 0.082, note: 'DEFRA/ICAO short-haul international' },
            defra_2024: { value: 0.082, note: 'DEFRA 2024 short-haul without RF' },
            epa_2024:   { value: 0.088, note: 'EPA medium haul flights' }
          }
        },
        air_long_haul: {
          label: '장거리 국제선 항공 (> 3,700km)',
          scope: 3,
          unit: 'kgCO2e/passenger·km',
          description: '장거리 국제선 항공 이코노미 기준 배출량 (미주/유럽)',
          formula: 'GHG = 비행거리(km) × 인원 × 배출계수 × 좌석승수 (× RF승수)',
          values: {
            kr_default: { value: 0.102, note: 'DEFRA/ICAO long-haul international' },
            defra_2024: { value: 0.102, note: 'DEFRA 2024 long-haul without RF' },
            epa_2024:   { value: 0.110, note: 'EPA long haul flights' }
          }
        },
        air_rf_multiplier: {
          label: '항공 복사강제력 (Radiative Forcing)',
          scope: 3,
          unit: 'multiplier',
          description: '고고도 권운 온실효과 증폭 승수 (DEFRA 2024 / IPCC)',
          formula: '배출량(RF) = 순수연소 배출량 × 1.9',
          values: {
            kr_default: { value: 1.90, note: 'DEFRA 2024 표준 권장 승수 (1.9x)' },
            defra_2024: { value: 1.90, note: 'DEFRA 2024 official RF factor' },
            epa_2024:   { value: 2.00, note: 'US EPA aviation RF factor' }
          }
        },
        air_seat_business: {
          label: '항공 비즈니스석 승수',
          scope: 3,
          unit: 'multiplier',
          description: '이코노미 대비 비즈니스 클래스 면적·중량 배분 배수',
          formula: '배출량 = 이코노미 배출량 × 2.9',
          values: {
            kr_default: { value: 2.90, note: 'DEFRA 2024 / ICAO Business class' },
            defra_2024: { value: 2.90, note: 'DEFRA 2024 Business class' },
            epa_2024:   { value: 2.85, note: 'EPA Premium cabin' }
          }
        },
        air_seat_default_weighted: {
          label: '항공 결측 시 표준 좌석 승수 (80:20)',
          scope: 3,
          unit: 'multiplier',
          description: '이코노미 80% + 비즈니스 20% 가중평균 승수 (가이드라인 4.3)',
          formula: '0.8 * 1.0 + 0.2 * 2.9 = 1.38',
          values: {
            kr_default: { value: 1.38, note: '0.8*1.0 + 0.2*2.9 = 1.38x' },
            defra_2024: { value: 1.38, note: 'NZCE standard proxy' },
            epa_2024:   { value: 1.38, note: 'Default cabin mix' }
          }
        },
        bus_express: {
          label: '고속버스/시외버스',
          scope: 3,
          unit: 'kgCO2e/passenger·km',
          description: '고속버스 1인·km당 배출량',
          formula: 'GHG = 이동거리(km) × 인원 × 배출계수',
          values: {
            kr_default: { value: 0.030, note: '환경부 고속버스 인벤토리' },
            defra_2024: { value: 0.028, note: 'DEFRA coach per passenger' },
            epa_2024:   { value: 0.032, note: 'EPA intercity bus' }
          }
        },
        car_ev: {
          label: '전기차 (EV 승용차)',
          scope: 3,
          unit: 'kgCO2e/km',
          description: '전기 승용차 1km 주행 시 배출량 (한국 계통전력 기준)',
          formula: 'GHG = 이동거리(km) × 배출계수',
          values: {
            kr_default: { value: 0.045, note: '한국 전력계통 기준 (내연기관 대비 72% 감축)' },
            defra_2024: { value: 0.024, note: 'DEFRA BEV car' },
            epa_2024:   { value: 0.040, note: 'EPA BEV average' }
          }
        },
        ferry_passenger: {
          label: '여객선 (연안/국제)',
          scope: 3,
          unit: 'kgCO2e/passenger·km',
          description: '여객 선박 1인·km당 배출량',
          formula: 'GHG = 항로거리(km) × 인원 × 배출계수',
          values: {
            kr_default: { value: 0.115, note: 'DEFRA 2024 passenger ferry' },
            defra_2024: { value: 0.115, note: 'DEFRA passenger ferry' },
            epa_2024:   { value: 0.120, note: 'EPA ferry passenger·km' }
          }
        },

        // ─── 5. 현지 교통 (Local Transportation - 가이드라인 5.2/5.3) ───
        local_taxi: {
          label: '현지 택시 (차량·거리 기반, 공식 1)',
          scope: 3,
          unit: 'kgCO2e/km',
          description: '행사 도시 내 택시 1km 주행 시 배출량',
          formula: 'GHG = 이동거리(km) × 배출계수(kgCO2e/km)',
          values: {
            kr_default: { value: 0.190, note: '국내 택시/중형 승용차 평균' },
            defra_2024: { value: 0.203, note: 'DEFRA regular taxi' },
            epa_2024:   { value: 0.210, note: 'EPA passenger taxi' }
          }
        },
        local_taxi_carpool: {
          label: '현지 택시 (카풀 1.5인 기본 계수, 가이드라인 5.2)',
          scope: 3,
          unit: 'kgCO2e/passenger·km',
          description: '동승자 정보 부재 시 1.5인 탑승 간주 배출량 (0.190 / 1.5)',
          formula: 'GHG = 이동거리(km) × 탑승객수 × (0.190 / 1.5)',
          values: {
            kr_default: { value: 0.1267, note: '0.190 kg / 1.5명 = 0.1267 kgCO2e/p·km' },
            defra_2024: { value: 0.1353, note: 'DEFRA taxi / 1.5' },
            epa_2024:   { value: 0.1400, note: 'EPA taxi / 1.5' }
          }
        },
        local_shuttle_pkm: {
          label: '행사 전용 셔틀버스 (승객·거리 기반, 공식 2)',
          scope: 3,
          unit: 'kgCO2e/passenger·km',
          description: '45인승 대형 셔틀버스 평균 25인 탑승 시 1인당 배출량',
          formula: 'GHG = 이동거리(km) × 탑승객수 × 배출계수',
          values: {
            kr_default: { value: 0.034, note: '대형버스 0.85kg / 25명 기준' },
            defra_2024: { value: 0.035, note: 'DEFRA local chartered coach' },
            epa_2024:   { value: 0.037, note: 'EPA chartered transit' }
          }
        },
        local_transit_pkm: {
          label: '현지 대중교통 (시내버스/지하철 가중평균)',
          scope: 3,
          unit: 'kgCO2e/passenger·km',
          description: '행사 도시 내 시내버스(50%) 및 지하철(50%) 복합 배출량',
          formula: 'GHG = 이동거리(km) × 탑승객수 × 배출계수',
          values: {
            kr_default: { value: 0.0275, note: '(버스 0.040 + 지하철 0.015) / 2' },
            defra_2024: { value: 0.0315, note: 'DEFRA local transit mix' },
            epa_2024:   { value: 0.0400, note: 'EPA local transit' }
          }
        },

        // ─── 5.3 직영/임차 차량 연료 소비 기반 (공식 3) ───
        fuel_diesel_liter: {
          label: '경유 (디젤 연료 소비량 기반, 공식 3)',
          scope: 1,
          unit: 'kgCO2e/L',
          description: '경유 1리터 연소 배출량',
          formula: 'GHG = 연료 소비량(L) × 2.670 kgCO2e/L',
          values: {
            kr_default: { value: 2.670, note: '환경부 온실가스 배출계수 (경유)' },
            defra_2024: { value: 2.705, note: 'DEFRA 2024 100% mineral diesel' },
            epa_2024:   { value: 2.680, note: 'EPA diesel fuel' }
          }
        },
        fuel_gasoline_liter: {
          label: '휘발유 (가솔린 연료 소비량 기반, 공식 3)',
          scope: 1,
          unit: 'kgCO2e/L',
          description: '휘발유 1리터 연소 배출량',
          formula: 'GHG = 연료 소비량(L) × 2.320 kgCO2e/L',
          values: {
            kr_default: { value: 2.320, note: '환경부 온실가스 배출계수 (휘발유)' },
            defra_2024: { value: 2.339, note: 'DEFRA 2024 petrol' },
            epa_2024:   { value: 2.310, note: 'EPA motor gasoline' }
          }
        },
        fuel_lpg_liter: {
          label: 'LPG (액화석유가스 연료 소비량 기반, 공식 3)',
          scope: 1,
          unit: 'kgCO2e/L',
          description: 'LPG 1리터 연소 배출량',
          formula: 'GHG = 연료 소비량(L) × 1.860 kgCO2e/L',
          values: {
            kr_default: { value: 1.860, note: '환경부 온실가스 배출계수 (LPG)' },
            defra_2024: { value: 1.870, note: 'DEFRA 2024 LPG' },
            epa_2024:   { value: 1.850, note: 'EPA LPG' }
          }
        },

        // ─── 5.3 상류(WTT: Well-to-Tank) 배출계수 ───
        wtt_taxi_km: {
          label: 'WTT 택시 상류 배출계수 (WTT 공식 1)',
          scope: 3,
          unit: 'kgCO2e/km',
          description: '택시 주행에 따른 연료 채굴·정제·수송 상류 배출',
          formula: 'GHG = 이동거리(km) × 0.045 kgCO2e/km',
          values: {
            kr_default: { value: 0.045, note: 'DEFRA/환경부 승용차 WTT' },
            defra_2024: { value: 0.047, note: 'DEFRA 2024 car WTT' },
            epa_2024:   { value: 0.048, note: 'EPA upstream fuel factor' }
          }
        },
        wtt_shuttle_pkm: {
          label: 'WTT 셔틀 상류 배출계수 (WTT 공식 2)',
          scope: 3,
          unit: 'kgCO2e/passenger·km',
          description: '셔틀버스 탑승객·거리당 연료 상류 배출량',
          formula: 'GHG = 이동거리(km) × 인원 × 0.007 kgCO2e/p·km',
          values: {
            kr_default: { value: 0.007, note: 'DEFRA 2024 bus WTT' },
            defra_2024: { value: 0.007, note: 'DEFRA 2024 bus WTT' },
            epa_2024:   { value: 0.008, note: 'EPA transit WTT' }
          }
        },
        wtt_transit_pkm: {
          label: 'WTT 대중교통 상류 배출계수 (WTT 공식 2)',
          scope: 3,
          unit: 'kgCO2e/passenger·km',
          description: '시내버스/지하철 승객당 연료·발전 상류 배출량',
          formula: 'GHG = 이동거리(km) × 인원 × 0.005 kgCO2e/p·km',
          values: {
            kr_default: { value: 0.005, note: '대중교통 WTT 평균' },
            defra_2024: { value: 0.0055, note: 'DEFRA local public transit WTT' },
            epa_2024:   { value: 0.006, note: 'EPA public transit WTT' }
          }
        },
        wtt_fuel_diesel_liter: {
          label: 'WTT 경유 상류 배출계수 (WTT 공식 3)',
          scope: 3,
          unit: 'kgCO2e/L',
          description: '경유 1리터 제조·정제·유통 상류 배출량',
          formula: 'GHG = 연료 소비량(L) × 0.610 kgCO2e/L',
          values: {
            kr_default: { value: 0.610, note: 'DEFRA 2024 diesel WTT' },
            defra_2024: { value: 0.610, note: 'DEFRA 2024 diesel WTT' },
            epa_2024:   { value: 0.620, note: 'EPA diesel WTT' }
          }
        },
        wtt_fuel_gasoline_liter: {
          label: 'WTT 휘발유 상류 배출계수 (WTT 공식 3)',
          scope: 3,
          unit: 'kgCO2e/L',
          description: '휘발유 1리터 제조·정제·유통 상류 배출량',
          formula: 'GHG = 연료 소비량(L) × 0.580 kgCO2e/L',
          values: {
            kr_default: { value: 0.580, note: 'DEFRA 2024 petrol WTT' },
            defra_2024: { value: 0.580, note: 'DEFRA 2024 petrol WTT' },
            epa_2024:   { value: 0.590, note: 'EPA gasoline WTT' }
          }
        },
        wtt_fuel_lpg_liter: {
          label: 'WTT LPG 상류 배출계수 (WTT 공식 3)',
          scope: 3,
          unit: 'kgCO2e/L',
          description: 'LPG 1리터 제조·정제·유통 상류 배출량',
          formula: 'GHG = 연료 소비량(L) × 0.350 kgCO2e/L',
          values: {
            kr_default: { value: 0.350, note: 'DEFRA 2024 LPG WTT' },
            defra_2024: { value: 0.350, note: 'DEFRA 2024 LPG WTT' },
            epa_2024:   { value: 0.360, note: 'EPA LPG WTT' }
          }
        }
      }
    },

    // ═══ NZCE Category 2: 화물 및 물류 (Freight & Logistics) ═══
    freight: {
      label: '화물·물류',
      nzceCategory: 2,
      items: {
        van_1t_diesel: {
          label: '1톤 화물차 (경유)',
          scope: 3,
          unit: 'kgCO2e/km',
          description: '1톤 디젤 화물차 km당 배출계수',
          formula: 'GHG = 운송거리(km) × 배출계수 × 안분율',
          values: {
            kr_default: { value: 0.2492, note: '한국교통안전공단 소형 화물 평균' },
            defra_2024: { value: 0.2580, note: 'DEFRA Class II diesel van' },
            epa_2024:   { value: 0.2650, note: 'EPA light commercial vehicle' }
          }
        },
        van_1t_electric: {
          label: '1톤 전기 화물차 (EV)',
          scope: 3,
          unit: 'kgCO2e/km',
          description: '1톤 전기 화물차 km당 배출계수 (전력 전환)',
          formula: 'GHG = 운송거리(km) × 배출계수 × 안분율',
          values: {
            kr_default: { value: 0.0890, note: '한국 전력계통 기준 EV 화물 (64% 감축)' },
            defra_2024: { value: 0.0450, note: 'DEFRA battery electric van' },
            epa_2024:   { value: 0.0780, note: 'EPA electric light truck' }
          }
        },
        truck_heavy: {
          label: '중대형 트럭 (5t~11t)',
          scope: 3,
          unit: 'kgCO2e/ton·km',
          description: '중대형 트럭 톤·km당 배출계수 (GLEC Framework)',
          formula: 'GHG = 거리(km) × 중량(ton) × 배출계수 × 안분율',
          values: {
            kr_default: { value: 0.1650, note: 'GLEC 2024 / 한국 도로화물 평균' },
            defra_2024: { value: 0.1582, note: 'DEFRA rigid HGV average' },
            epa_2024:   { value: 0.1720, note: 'EPA combination truck ton·mile 환산' }
          }
        },
        rail_freight: {
          label: '철도 화물 (모달시프트)',
          scope: 3,
          unit: 'kgCO2e/ton·km',
          description: '철도 화물 톤·km당 배출계수',
          formula: 'GHG = 거리(km) × 중량(ton) × 배출계수 × 안분율',
          values: {
            kr_default: { value: 0.0245, note: '한국철도공사 화물 톤·km 기준 (85% 감축)' },
            defra_2024: { value: 0.0221, note: 'DEFRA freight train average' },
            epa_2024:   { value: 0.0258, note: 'EPA rail freight ton·mile 환산' }
          }
        },
        electric_forklift: {
          label: '전동 지게차 (현장 하역)',
          scope: 1,
          unit: 'kgCO2e/회',
          description: '디젤 지게차 대비 전동 지게차 전환 시 Scope 1 직접 감축량',
          formula: '감축량 = 투입 횟수(회) × 배출계수(kgCO2e/회)',
          values: {
            kr_default: { value: 25.0, note: '디젤 지게차 8시간 가동 대체 기준' },
            defra_2024: { value: 24.5, note: 'DEFRA off-road diesel vs electric' },
            epa_2024:   { value: 26.0, note: 'EPA non-road diesel reduction' }
          }
        }
      }
    },

    // ═══ NZCE Category 3: 식음료 (Food & Beverage) ═══
    food: {
      label: '식음료',
      nzceCategory: 3,
      items: {
        reusable_cup: {
          label: '다회용 컵 (1회 감축)',
          scope: 3,
          unit: 'gCO2e/개',
          description: '1회용 종이컵 대비 다회용 컵 사용 시 감축량',
          formula: '감축량 = 사용 횟수 × 배출계수(gCO2e/개)',
          values: {
            kr_default: { value: 52, note: '환경부 1회용 종이컵 LCA 기준' },
            defra_2024: { value: 48, note: 'DEFRA disposable cup LCA' },
            epa_2024:   { value: 55, note: 'EPA WARM model paper cup' }
          }
        },
        reusable_plate: {
          label: '다회용 접시 (1회 감축)',
          scope: 3,
          unit: 'gCO2e/개',
          description: '1회용 접시 대비 다회용 접시 사용 시 감축량',
          formula: '감축량 = 사용 횟수 × 배출계수(gCO2e/개)',
          values: {
            kr_default: { value: 37, note: '환경부 1회용 플라스틱 접시 LCA' },
            defra_2024: { value: 34, note: 'DEFRA plastic plate LCA' },
            epa_2024:   { value: 40, note: 'EPA WARM model' }
          }
        },
        reusable_bowl: {
          label: '다회용 볼 (1회 감축)',
          scope: 3,
          unit: 'gCO2e/개',
          description: '1회용 용기 대비 다회용 볼 사용 시 감축량',
          formula: '감축량 = 사용 횟수 × 배출계수(gCO2e/개)',
          values: {
            kr_default: { value: 60, note: '환경부 1회용 스티로폼 용기 LCA' },
            defra_2024: { value: 55, note: 'DEFRA single-use bowl LCA' },
            epa_2024:   { value: 62, note: 'EPA WARM model' }
          }
        },
        reusable_fork: {
          label: '다회용 수저 (1회 감축)',
          scope: 3,
          unit: 'gCO2e/개',
          description: '1회용 수저 대비 다회용 수저 사용 시 감축량',
          formula: '감축량 = 사용 횟수 × 배출계수(gCO2e/개)',
          values: {
            kr_default: { value: 9, note: '환경부 1회용 플라스틱 수저 LCA' },
            defra_2024: { value: 8, note: 'DEFRA plastic cutlery LCA' },
            epa_2024:   { value: 10, note: 'EPA WARM model' }
          }
        },
        meal_meat_baseline: {
          label: '전통 육류 만찬 1식 (Baseline)',
          scope: 3,
          unit: 'kgCO2e/식',
          description: '소고기 중심 전통 MICE 케이터링 만찬 기준 배출량',
          formula: 'GHG = 식사 수 × 7.20 kgCO2e/식',
          values: {
            kr_default: { value: 7.20, note: 'Cool Food Pledge / Agribalyse' },
            defra_2024: { value: 7.10, note: 'UK Foodsteps standard beef gala dinner' },
            epa_2024:   { value: 7.35, note: 'US EPA Food GHG standard' }
          }
        },
        meal_low_carbon: {
          label: '저탄소 균형식 1식 (가금류·해산물)',
          scope: 3,
          unit: 'kgCO2e/식',
          description: '붉은 육류를 대체한 닭고기, 제철 해산물, 로컬 채소 중심 케이터링',
          formula: 'GHG = 식사 수 × 2.80 kgCO2e/식',
          values: {
            kr_default: { value: 2.80, note: 'Cool Food Pledge 저탄소식 기준' },
            defra_2024: { value: 2.70, note: 'UK Foodsteps poultry/fish mix' },
            epa_2024:   { value: 2.85, note: 'US EPA Low-carbon meal' }
          }
        },
        meal_vegan: {
          label: '식물성 비건·채식 1식',
          scope: 3,
          unit: 'kgCO2e/식',
          description: '100% 식물성 대체육 및 로컬 곡채류 중심 비건 식단',
          formula: 'GHG = 식사 수 × 1.20 kgCO2e/식',
          values: {
            kr_default: { value: 1.20, note: 'Agribalyse 3.1.1 100% plant-based' },
            defra_2024: { value: 1.15, note: 'Foodsteps vegan meal standard' },
            epa_2024:   { value: 1.25, note: 'US EPA vegan diet model' }
          }
        },
        beef: {
          label: '소고기 (Beef)',
          scope: 3,
          unit: 'kgCO2e/kg',
          description: '소고기 원재료 생산 및 가공 상류 배출계수',
          formula: 'GHG = 중량(kg) × 59.60 kgCO2e/kg',
          values: {
            kr_default: { value: 59.60, note: 'Agribalyse 3.1.1 / Poore & Nemecek' },
            defra_2024: { value: 58.90, note: 'DEFRA UK beef production' },
            epa_2024:   { value: 60.20, note: 'EPA Supply Chain beef' }
          }
        },
        pork: {
          label: '돼지고기 (Pork)',
          scope: 3,
          unit: 'kgCO2e/kg',
          description: '돼지고기 원재료 생산 및 가공 상류 배출계수',
          formula: 'GHG = 중량(kg) × 7.60 kgCO2e/kg',
          values: {
            kr_default: { value: 7.60, note: 'Agribalyse 3.1.1' },
            defra_2024: { value: 7.40, note: 'DEFRA UK pork' },
            epa_2024:   { value: 7.75, note: 'EPA pork factor' }
          }
        },
        poultry: {
          label: '닭고기/가금류 (Poultry)',
          scope: 3,
          unit: 'kgCO2e/kg',
          description: '가금류 원재료 생산 및 가공 상류 배출계수',
          formula: 'GHG = 중량(kg) × 5.70 kgCO2e/kg',
          values: {
            kr_default: { value: 5.70, note: 'Agribalyse 3.1.1' },
            defra_2024: { value: 5.50, note: 'DEFRA poultry' },
            epa_2024:   { value: 5.80, note: 'EPA poultry' }
          }
        },
        fish: {
          label: '어류/해산물 (Fish/Seafood)',
          scope: 3,
          unit: 'kgCO2e/kg',
          description: '해산물 원재료 생산 및 유통 상류 배출계수',
          formula: 'GHG = 중량(kg) × 5.10 kgCO2e/kg',
          values: {
            kr_default: { value: 5.10, note: 'Cool Food Pledge seafood' },
            defra_2024: { value: 5.00, note: 'DEFRA wild/farmed fish average' },
            epa_2024:   { value: 5.25, note: 'EPA seafood' }
          }
        },
        plant_protein: {
          label: '식물성 대체육/두류 (Plant Protein)',
          scope: 3,
          unit: 'kgCO2e/kg',
          description: '대두/완두 기반 식물성 단백질 및 대체육',
          formula: 'GHG = 중량(kg) × 2.20 kgCO2e/kg',
          values: {
            kr_default: { value: 2.20, note: 'Foodsteps plant-based meat alternative' },
            defra_2024: { value: 2.10, note: 'DEFRA tofu & soy products' },
            epa_2024:   { value: 2.30, note: 'EPA plant protein' }
          }
        },
        vegetables_fruits: {
          label: '신선 채소 및 과일 (Vegetables & Fruits)',
          scope: 3,
          unit: 'kgCO2e/kg',
          description: '노지/로컬 채소 및 제철 과일 원재료 배출계수',
          formula: 'GHG = 중량(kg) × 0.80 kgCO2e/kg',
          values: {
            kr_default: { value: 0.80, note: 'Agribalyse 3.1.1 vegetables average' },
            defra_2024: { value: 0.75, note: 'DEFRA fresh produce' },
            epa_2024:   { value: 0.85, note: 'EPA produce' }
          }
        },
        coffee: {
          label: '원두 커피 (Coffee)',
          scope: 3,
          unit: 'kgCO2e/kg',
          description: '볶은 원두 기준 상류 공급망 배출계수 (잔당 약 15g 환산)',
          formula: 'GHG = 중량(kg) × 16.50 kgCO2e/kg',
          values: {
            kr_default: { value: 16.50, note: 'Ecoinvent v3.9.1 roasted coffee beans' },
            defra_2024: { value: 16.10, note: 'DEFRA roasted coffee' },
            epa_2024:   { value: 16.80, note: 'EPA coffee supply chain' }
          }
        }
      }
    },

    // ═══ NZCE Category 1: 생산 및 자재 (Production & Materials) ═══
    production: {
      label: '생산·자재',
      nzceCategory: 1,
      items: {
        keyring_new: {
          label: '키링 신규 제작 (배출)',
          scope: 3,
          unit: 'gCO2e/개',
          description: '아크릴 키링 1개 신규 제작 시 배출량',
          formula: '배출량 = 제작 수량 × 배출계수(gCO2e/개)',
          values: {
            kr_default: { value: 50, note: '아크릴 소재 신규 키링 LCA' },
            defra_2024: { value: 45, note: 'DEFRA acrylic product LCA' },
            epa_2024:   { value: 52, note: 'EPA plastics LCA' }
          }
        },
        keyring_upcycle: {
          label: '키링 업사이클 (감축)',
          scope: 3,
          unit: 'gCO2e/개',
          description: '업사이클링 키링 1개당 순 감축량',
          formula: '감축량 = 수량 × (업사이클 감축 - 물류 배출)',
          values: {
            kr_default: { value: 16, note: '업사이클 1개당 순 감축' },
            defra_2024: { value: 14, note: 'DEFRA recycled product LCA' },
            epa_2024:   { value: 17, note: 'EPA upcycled product LCA' }
          }
        },
        banner_upcycle: {
          label: '현수막 업사이클 (감축)',
          scope: 3,
          unit: 'gCO2e/장',
          description: '현수막 1장 업사이클 시 감축량',
          formula: '감축량 = 업사이클 수량 × 배출계수(gCO2e/장)',
          values: {
            kr_default: { value: 6280, note: '현수막 소각 회피 + 재생 효과' },
            defra_2024: { value: 5900, note: 'DEFRA PVC banner LCA' },
            epa_2024:   { value: 6500, note: 'EPA vinyl banner LCA' }
          }
        },
        paper_booth: {
          label: '종이 부스 전환 (감축)',
          scope: 3,
          unit: 'gCO2e/부스',
          description: '기존 목재 부스 대비 종이 부스 전환 시 감축량',
          formula: '감축량 = 부스 수 × 배출계수(gCO2e/부스)',
          values: {
            kr_default: { value: 10125, note: '목재 부스 대비 종이 부스 LCA' },
            defra_2024: { value: 9800, note: 'DEFRA cardboard vs wood LCA' },
            epa_2024:   { value: 10500, note: 'EPA corrugated vs wood LCA' }
          }
        }
      }
    },

    // ═══ NZCE Category 9: 디지털 콘텐츠 (Digital Content) ═══
    digital: {
      label: '디지털 콘텐츠',
      nzceCategory: 9,
      items: {
        paper_a4: {
          label: 'A4 용지 감축',
          scope: 3,
          unit: 'gCO2e/장',
          description: 'A4 용지 1장 사용 회피 시 감축량',
          formula: '감축량 = 절감 매수 × 배출계수(gCO2e/장)',
          values: {
            kr_default: { value: 6.2, note: '국내 A4 생산 LCA' },
            defra_2024: { value: 5.8, note: 'DEFRA paper LCA' },
            epa_2024:   { value: 6.5, note: 'EPA WARM model paper' }
          }
        },
        brochure: {
          label: '브로셔 감축 (A5 기준)',
          scope: 3,
          unit: 'gCO2e/부',
          description: '인쇄 브로셔 1부 사용 회피 시 감축량',
          formula: '감축량 = 절감 부수 × 배출계수(gCO2e/부)',
          values: {
            kr_default: { value: 25, note: '국내 인쇄물 LCA' },
            defra_2024: { value: 23, note: 'DEFRA printed brochure LCA' },
            epa_2024:   { value: 27, note: 'EPA WARM model' }
          }
        }
      }
    },

    // ═══ NZCE Category 8: 폐기물 (Waste) ═══
    waste: {
      label: '폐기물',
      nzceCategory: 8,
      items: {
        recycling_per_kg: {
          label: '재활용 분리배출 (1kg)',
          scope: 3,
          unit: 'gCO2e/kg',
          description: '매립 대비 재활용 분리배출 시 감축량',
          formula: '감축량 = 분리배출량(kg) × 배출계수(gCO2e/kg)',
          values: {
            kr_default: { value: 470, note: '국내 혼합 폐기물 매립 대비 재활용' },
            defra_2024: { value: 430, note: 'DEFRA mixed recycling' },
            epa_2024:   { value: 490, note: 'EPA WARM model mixed recycling' }
          }
        }
      }
    }
  };


  // ─── 활성 프로필 관리 (localStorage 영속) ──────────────────────────────
  const STORAGE_KEY = 'mice_ef_profile';
  const CUSTOM_VALUES_KEY = 'mice_ef_custom_values';

  function getActivePresetId() {
    return localStorage.getItem(STORAGE_KEY) || 'kr_default';
  }

  function setActivePresetId(presetId) {
    localStorage.setItem(STORAGE_KEY, presetId);
    window.dispatchEvent(new CustomEvent('ef-profile-changed', { detail: { presetId } }));
  }

  function getCustomValues() {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_VALUES_KEY) || '{}');
    } catch(e) { return {}; }
  }

  function setCustomValue(category, item, value) {
    const cv = getCustomValues();
    if (!cv[category]) cv[category] = {};
    cv[category][item] = value;
    localStorage.setItem(CUSTOM_VALUES_KEY, JSON.stringify(cv));
  }


  // ─── 배출계수 조회 API ─────────────────────────────────────────────────
  function getEF(category, item) {
    const presetId = getActivePresetId();
    const db = EF_DATABASE[category];
    if (!db || !db.items[item]) {
      console.warn('[EF] Unknown: ' + category + '.' + item);
      return 0;
    }
    if (presetId === 'custom') {
      const cv = getCustomValues();
      if (cv[category] && cv[category][item] !== undefined) {
        return cv[category][item];
      }
    }
    const itemData = db.items[item];
    const presetValues = itemData.values[presetId] || itemData.values['kr_default'];
    return presetValues ? presetValues.value : 0;
  }

  function getEFInfo(category, item) {
    const presetId = getActivePresetId();
    const preset = EF_PRESETS[presetId] || EF_PRESETS['kr_default'];
    const db = EF_DATABASE[category];
    if (!db || !db.items[item]) return null;

    const itemData = db.items[item];
    const valueData = itemData.values[presetId] || itemData.values['kr_default'];
    var actualValue = valueData ? valueData.value : 0;
    var note = valueData ? valueData.note : '';

    if (presetId === 'custom') {
      const cv = getCustomValues();
      if (cv[category] && cv[category][item] !== undefined) {
        actualValue = cv[category][item];
        note = '사용자 직접 입력';
      }
    }

    return {
      value: actualValue,
      label: itemData.label,
      scope: itemData.scope,
      unit: itemData.unit,
      description: itemData.description,
      formula: itemData.formula,
      source: preset.source,
      presetName: preset.name,
      note: note
    };
  }

  function getScopeBadge(scopeNum) {
    var badges = {
      1: { label: 'Scope 1', color: 'rose', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', desc: '직접 배출' },
      2: { label: 'Scope 2', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', desc: '간접 에너지' },
      3: { label: 'Scope 3', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', desc: '가치사슬' }
    };
    return badges[scopeNum] || badges[3];
  }

  function getActivePresetInfo() {
    const presetId = getActivePresetId();
    return EF_PRESETS[presetId] || EF_PRESETS['kr_default'];
  }

  function getAllActiveEFs() {
    var result = {};
    for (var catKey in EF_DATABASE) {
      var catData = EF_DATABASE[catKey];
      result[catKey] = { label: catData.label, items: {} };
      for (var itemKey in catData.items) {
        result[catKey].items[itemKey] = getEFInfo(catKey, itemKey);
      }
    }
    return result;
  }

  // ─── 모달 UI 컨트롤러 ──────────────────────────────────────────────────
  var currentViewingPresetId = getActivePresetId();
  var currentViewingCategory = 'energy';

  function openEmissionFactorModal() {
    var modal = document.getElementById('emissionFactorSettingsModal');
    if (!modal) {
      console.warn('[EF Modal] emissionFactorSettingsModal not found in DOM yet.');
      return;
    }
    currentViewingPresetId = getActivePresetId();
    selectEfPreset(currentViewingPresetId);
    showEfCategory('energy');

    modal.classList.remove('hidden');
    setTimeout(function() {
      modal.classList.remove('opacity-0');
      var inner = modal.querySelector('.bg-white') || modal.firstElementChild;
      if (inner) inner.classList.remove('scale-95');
    }, 10);
    if (window.lucide) window.lucide.createIcons();
  }

  function closeEmissionFactorModal() {
    var modal = document.getElementById('emissionFactorSettingsModal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    var inner = modal.querySelector('.bg-white') || modal.firstElementChild;
    if (inner) inner.classList.add('scale-95');
    setTimeout(function() {
      modal.classList.add('hidden');
    }, 300);
  }

  function selectEfPreset(presetId) {
    currentViewingPresetId = presetId;
    var presets = Object.keys(EF_PRESETS);

    // Update preset cards UI
    presets.forEach(function(id) {
      var card = document.getElementById('ef-card-' + id);
      if (!card) return;
      if (id === presetId) {
        card.className = 'ef-preset-card cursor-pointer p-3.5 rounded-2xl border-2 transition-all bg-white border-blue-500 shadow-md ring-2 ring-blue-400/30 relative';
      } else {
        card.className = 'ef-preset-card cursor-pointer p-3.5 rounded-2xl border-2 transition-all bg-white border-slate-200 hover:border-slate-300';
      }
    });

    // Update summary banner
    var p = EF_PRESETS[presetId] || EF_PRESETS['kr_default'];
    var iconEl = document.getElementById('ef-summary-icon');
    var nameEl = document.getElementById('ef-summary-name');
    var descEl = document.getElementById('ef-summary-desc');
    var sourceEl = document.getElementById('ef-summary-source');
    var yearEl = document.getElementById('ef-summary-year');
    var badgeEl = document.getElementById('ef-summary-badge');

    if (iconEl) iconEl.textContent = p.icon;
    if (nameEl) nameEl.textContent = p.name;
    if (descEl) descEl.textContent = p.description;
    if (sourceEl) sourceEl.textContent = p.source;
    if (yearEl) yearEl.textContent = p.year ? (p.year + '년') : '사용자 입력';
    if (badgeEl) badgeEl.textContent = (presetId === getActivePresetId()) ? '현재 활성' : '선택 대기중';

    renderEfTable(currentViewingCategory);
  }

  function showEfCategory(catKey) {
    currentViewingCategory = catKey;
    var tabsContainer = document.getElementById('ef-category-tabs');
    if (tabsContainer) {
      var buttons = tabsContainer.querySelectorAll('.ef-cat-btn');
      buttons.forEach(function(btn) {
        btn.className = 'ef-cat-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-slate-600 hover:text-slate-900 flex items-center gap-1.5 flex-shrink-0';
      });
      var activeTab = document.getElementById('ef-tab-' + catKey);
      if (activeTab) {
        activeTab.className = 'ef-cat-btn px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all bg-white text-blue-700 shadow-xs flex items-center gap-1.5 flex-shrink-0';
      }
    }
    renderEfTable(catKey);
  }

  function renderEfTable(catKey) {
    var container = document.getElementById('ef-items-table-container');
    if (!container) return;

    var catData = EF_DATABASE[catKey];
    if (!catData) return;

    var isCustom = (currentViewingPresetId === 'custom');
    var customVals = getCustomValues();

    var html = '<table class="w-full text-left text-xs text-slate-600 border-collapse">';
    html += '<thead class="bg-slate-50 text-[11px] font-black text-slate-700 uppercase tracking-wider border-b border-slate-200/80">';
    html += '<tr>';
    html += '<th class="py-2.5 px-3">산정 항목명</th>';
    html += '<th class="py-2.5 px-2.5 text-center">Scope</th>';
    html += '<th class="py-2.5 px-3">산정 공식 (NZCE)</th>';
    html += '<th class="py-2.5 px-3 text-right">적용 배출계수</th>';
    html += '<th class="py-2.5 px-3">단위</th>';
    html += '<th class="py-2.5 px-3">산출 근거 / 출처 비고</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody class="divide-y divide-slate-100">';

    for (var itemKey in catData.items) {
      var item = catData.items[itemKey];
      var badge = getScopeBadge(item.scope);
      var valData = item.values[currentViewingPresetId] || item.values['kr_default'];
      var displayVal = valData ? valData.value : 0;
      var note = valData ? valData.note : '';

      if (isCustom && customVals[catKey] && customVals[catKey][itemKey] !== undefined) {
        displayVal = customVals[catKey][itemKey];
        note = '사용자 직접 입력값';
      }

      html += '<tr class="hover:bg-slate-50/70 transition-colors">';
      html += '<td class="py-3 px-3 font-extrabold text-slate-900">';
      html += '<div class="text-xs">' + item.label + '</div>';
      html += '<div class="text-[10px] text-slate-400 font-normal">' + item.description + '</div>';
      html += '</td>';

      html += '<td class="py-3 px-2.5 text-center">';
      html += '<span class="inline-block ' + badge.bg + ' ' + badge.text + ' ' + badge.border + ' border text-[9px] font-black px-2 py-0.5 rounded-md leading-none whitespace-nowrap">' + badge.label + '</span>';
      html += '</td>';

      html += '<td class="py-3 px-3 font-mono text-[10px] text-slate-500">';
      html += item.formula;
      html += '</td>';

      html += '<td class="py-3 px-3 text-right">';
      if (isCustom) {
        html += '<input type="number" step="any" value="' + displayVal + '" onchange="EmissionFactors.setCustomValue(\'' + catKey + '\', \'' + itemKey + '\', parseFloat(this.value));" class="w-24 px-2 py-1 text-right text-xs font-mono font-bold bg-amber-50 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">';
      } else {
        html += '<span class="font-mono font-black text-slate-900 text-sm">' + displayVal + '</span>';
      }
      html += '</td>';

      html += '<td class="py-3 px-3 text-[11px] font-bold text-slate-500 font-mono">';
      html += item.unit;
      html += '</td>';

      html += '<td class="py-3 px-3 text-[10.5px] text-slate-600">';
      html += '<span class="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-700 font-medium">' + note + '</span>';
      html += '</td>';

      html += '</tr>';
    }

    html += '</tbody>';
    html += '</table>';

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  }

  function applyEmissionFactorSettings() {
    setActivePresetId(currentViewingPresetId);
    closeEmissionFactorModal();
    updateAllEfDisplays();

    var p = EF_PRESETS[currentViewingPresetId] || EF_PRESETS['kr_default'];
    if (typeof window.showToast === 'function') {
      window.showToast('배출계수 기준이 [' + p.name + '](으)로 적용되었습니다.');
    }
  }

  function updateAllEfDisplays() {
    var p = getActivePresetInfo();

    // 1. Button label in Section 04 header
    var btnNameEl = document.getElementById('btn-active-preset-name');
    if (btnNameEl) btnNameEl.textContent = p.shortName;

    // 2. Dashboard profile card
    var dashIconEl = document.getElementById('dash-ef-icon');
    var dashNameEl = document.getElementById('dash-ef-name');
    if (dashIconEl) dashIconEl.textContent = p.icon;
    if (dashNameEl) dashNameEl.textContent = p.name;

    // 3. Modals' dynamic emission factor notes
    var ecoSourceName = document.getElementById('eco-ef-source-name');
    if (ecoSourceName) ecoSourceName.textContent = p.name;

    var energyEfVal = document.getElementById('energy-ef-value');
    var energyEfSource = document.getElementById('energy-ef-source');
    if (energyEfVal) energyEfVal.textContent = getEF('energy', 'electricity_grid') + ' kgCO2e/kWh';
    if (energyEfSource) energyEfSource.textContent = p.name;

    var transportEfVal = document.getElementById('transport-ef-value');
    var transportEfSource = document.getElementById('transport-ef-source');
    if (transportEfVal) transportEfVal.textContent = getEF('transport', 'shuttle_reduction');
    if (transportEfSource) transportEfSource.textContent = p.name;

    // 4. PDF report compliance line
    var pdfEfSource = document.getElementById('pdf-ef-source-text');
    if (pdfEfSource) pdfEfSource.textContent = p.name + ' (' + p.source + ')';

    // 5. Trigger event for app.js recalculation
    window.dispatchEvent(new CustomEvent('ef-profile-changed', { detail: { presetId: p.id, preset: p } }));
  }


  // ─── 전역 노출 ────────────────────────────────────────────────────────
  window.EmissionFactors = {
    PRESETS: EF_PRESETS,
    DATABASE: EF_DATABASE,
    get: getEF,
    getInfo: getEFInfo,
    getActivePresetId: getActivePresetId,
    setActivePresetId: setActivePresetId,
    getActivePresetInfo: getActivePresetInfo,
    getAllActiveEFs: getAllActiveEFs,
    getScopeBadge: getScopeBadge,
    getCustomValues: getCustomValues,
    setCustomValue: setCustomValue,
    updateAllDisplays: updateAllEfDisplays
  };

  // Expose Modal UI handlers globally
  window.openEmissionFactorModal = openEmissionFactorModal;
  window.openEmissionFactorSettingsModal = openEmissionFactorModal;
  window.closeEmissionFactorModal = closeEmissionFactorModal;
  window.closeEmissionFactorSettingsModal = closeEmissionFactorModal;
  window.selectEfPreset = selectEfPreset;
  window.showEfCategory = showEfCategory;
  window.renderEfTable = renderEfTable;
  window.applyEmissionFactorSettings = applyEmissionFactorSettings;

  // Auto-init on page ready (browser environment)
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(updateAllEfDisplays, 100);
      });
    } else {
      setTimeout(updateAllEfDisplays, 100);
    }
  }

})();

