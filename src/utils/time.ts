/**
 * 将数字补零
 * @param num 需要补零的数字
 * @param length 需要的长度，默认为2
 * @returns 补零后的字符串
 */
function padZero(num: number, length: number = 2): string {
  return String(num).padStart(length, '0')
}

/**
 * 格式化时间戳
 * @param timestamp 秒级时间戳
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的时间字符串
 *
 * 支持的格式占位符：
 * YYYY: 年份，如 2023
 * MM: 月份，如 01-12
 * DD: 日期，如 01-31
 * HH: 小时，24小时制，如 00-23
 * hh: 小时，12小时制，如 01-12
 * mm: 分钟，如 00-59
 * ss: 秒钟，如 00-59
 * SSS: 毫秒，如 000-999
 * A: AM/PM 标识
 */
export function formatTimestamp(timestamp: number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  // 将秒级时间戳转换为毫秒级
  const date = new Date(timestamp * 1000)

  const year = date.getFullYear()
  const month = date.getMonth() + 1 // getMonth() 返回 0-11
  const day = date.getDate()
  const hours24 = date.getHours()
  const hours12 = hours24 % 12 || 12 // 12小时制
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  const milliseconds = date.getMilliseconds()
  const ampm = hours24 >= 12 ? 'PM' : 'AM'

  const replacements: Record<string, string> = {
    YYYY: String(year),
    MM: padZero(month),
    DD: padZero(day),
    HH: padZero(hours24),
    hh: padZero(hours12),
    mm: padZero(minutes),
    ss: padZero(seconds),
    SSS: padZero(milliseconds, 3),
    A: ampm
  }

  return format.replace(/YYYY|MM|DD|HH|hh|mm|ss|SSS|A/g, (match) => replacements[match])
}

/**
 * 获取当前时间的格式化字符串
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的当前时间字符串
 */
export function getCurrentTime(format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const timestamp = Math.floor(Date.now() / 1000) // 获取当前秒级时间戳
  return formatTimestamp(timestamp, format)
}

/**
 * 将时间字符串转换为秒级时间戳
 * @param dateStr 时间字符串，如 '2023-01-01 12:00:00'
 * @returns 秒级时间戳
 */
export function stringToTimestamp(dateStr: string): number {
  const timestamp = Math.floor(new Date(dateStr).getTime() / 1000)
  return timestamp
}

/**
 * 计算两个时间戳之间的时间差，返回人性化描述
 * @param timestamp1 较早的时间戳
 * @param timestamp2 较晚的时间戳，默认为当前时间
 * @returns 人性化的时间差描述
 */
export function getTimeDistance(timestamp1: number, timestamp2?: number): string {
  const currentTime = timestamp2 || Math.floor(Date.now() / 1000)
  const timeDiff = currentTime - timestamp1

  if (timeDiff < 60) {
    return `${timeDiff}秒前`
  } else if (timeDiff < 3600) {
    return `${Math.floor(timeDiff / 60)}分钟前`
  } else if (timeDiff < 86400) {
    return `${Math.floor(timeDiff / 3600)}小时前`
  } else if (timeDiff < 2592000) {
    return `${Math.floor(timeDiff / 86400)}天前`
  } else if (timeDiff < 31536000) {
    return `${Math.floor(timeDiff / 2592000)}个月前`
  } else {
    return `${Math.floor(timeDiff / 31536000)}年前`
  }
}
