#!/usr/bin/env bash
# 透過管理 port 新增 / 刪除使用者
#   ./user.sh add <username>   # 密碼用互動輸入，不會留在 shell history
#   ./user.sh del <username>
# 必須設定環境變數 ADMIN_URL（管理 server 位址），沒有預設值，例如：
#   ADMIN_URL=http://localhost:4096 ./user.sh add alice
set -euo pipefail
export LC_ALL=C   # 讓 ${s:i:1} 以 byte 為單位，URL encode 才正確

URL="${ADMIN_URL:?ADMIN_URL is required}/api/users"

json_escape() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

urlencode() {
    local s="$1" i c
    for ((i = 0; i < ${#s}; i++)); do
        c="${s:i:1}"
        case "$c" in
            [a-zA-Z0-9.~_-]) printf '%s' "$c" ;;
            *) printf '%%%02X' "'$c" ;;
        esac
    done
}

[[ $# -eq 2 ]] || { echo "usage: $0 add|del <username>" >&2; exit 1; }

case "$1" in
    add)
        read -rsp "password: " password; echo
        curl -sS -w '\n[%{http_code}]\n' -X POST -H 'Content-Type: application/json' \
            -d "{\"username\":\"$(json_escape "$2")\",\"password\":\"$(json_escape "$password")\"}" \
            "$URL"
        ;;
    del)
        curl -sS -w '[%{http_code}]\n' -X DELETE "$URL/$(urlencode "$2")"
        ;;
    *)
        echo "usage: $0 add|del <username>" >&2
        exit 1
        ;;
esac
