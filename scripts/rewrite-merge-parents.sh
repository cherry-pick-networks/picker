#!/bin/bash
# origin/main의 merge 커밋(1ddc1b0)만 부모 2명 유지, 나머지 merge는 부모 1명만 갖도록 재작성
# parent string: 한 줄에 "-p parent1 -p parent2 ..." 형식
set -e
KEEP_MERGE="1ddc1b0e2189124c9d4adc45ded53e19c279af86"
read -r line
if [ -z "$line" ] || [ "$GIT_COMMIT" = "$KEEP_MERGE" ]; then
  echo "$line"
else
  # 여러 부모면 첫 번째 "-p <hash>"만 출력
  echo "$line" | awk '{ for(i=1;i<=2;i++) printf "%s%s", $i, (i<2 ? " " : "\n") }'
fi
exit 0
