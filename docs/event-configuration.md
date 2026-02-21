# Exam schedule reference (중등 plans)

Reference for placing weekly plans and avoiding regular instruction during exam prep.
Source: 중등.ics (Google Calendar).

## 중등 공통

| 기간 | 구분 | 비고 |
|------|------|------|
| 3/30–4/29 | 1학기 중간고사 내신대비 | 중2·중3 휴강. 중1은 1학기 시험 없음 → 정규 수업 진행. |
| 6/1–7/3 | 1학기 기말고사 내신대비 | 중2·중3 휴강. |
| 8/31–9/28 | 2학기 중간고사 내신대비 | 중1·중2·중3 공통. |
| 11/16–12/14 | 2학기 기말고사 내신대비 | **중1·중2만** 해당. |

## 중3 전용

| 기간 | 구분 | 비고 |
|------|------|------|
| **10/5–11/2** | **2학기 기말고사 내신대비** | 고입 내신 산출용 조기 기말. **졸업 일정으로 중1/2보다 앞당겨짐.** 시험 일정 배치 시 이 구간 참조. |

## Plan 데이터 (grade 0–13)

- 파일명: `plans/{grade}.json` (grade는 0–13 정수). 예: 7=중1, 8=중2, 9=중3, 10=고1.
- `plans/7.json`: MW-02 (L1) ICS 기반, DTSTART 순 정렬.
- `plans/8.json`: MW-03 (L2) ICS 기반.
- `plans/9.json`: 8과 동일 구조, 교재명만 L2→L3 치환. 시험 일정 피해 배치할 때 위 표 참조.
- `plans/10.json`: 고1 CSV 기반.
