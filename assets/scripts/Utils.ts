// 将给定数字调整为8的倍数
function adjustNumber(number) {
    number = Math.round(number);

    if (number % 8 != 0) {
        for (let offset = 1; offset < 8; offset++) {
            if ((number + offset) % 8 == 0) {
                return number + offset;
            }

            if ((number - offset) % 8 == 0) {
                return number - offset;
            }
        }
    }

    return number;
}

export let Utils = {
    adjustNumber: adjustNumber,
}
