onmessage = (event) => {
    const {type} = event.data;

    if (type === 'start') {
        postMessage({type: "next"});
    } else if (type === 'process') {
        let {
            imageData,
            direction,
            word,
            searchLength,
            fgColor,
            startX,
            startY,
            markingColor
        } = event.data;

        let find = this.findXy(imageData,
            direction,
            word,
            searchLength,
            fgColor,
            startX,
            startY,
            markingColor);

        //이전 방향 탐색시 높을 자리가 없다면 다른 방향으로 재탐색
        if (!find) {
            direction = direction === "portrait" ? "landscape" : "portrait";

            find = this.findXy(imageData,
                direction,
                word,
                searchLength,
                fgColor,
                startX,
                startY,
                markingColor);
        }

        if (find) {
            postMessage({type: "result", word, direction, x: find.x, y: find.y});
        }
        postMessage({type: "next"});
    }
}

function findXy(imageData,
                direction,
                w,
                searchLength,
                fgColor,
                startX,
                startY,
                markingColor) {
    const {width, height} = imageData;
    const visited = new Set();
    const queue = [{x: startX, y: startY}];

    while (queue.length) {
        const {x, y} = queue.shift();

        for (let dx = -searchLength; dx <= searchLength; dx += searchLength) {
            for (let dy = -searchLength; dy <= searchLength; dy += searchLength) {
                const nextX = x + dx;
                const nextY = y + dy;
                const wordWidth = direction === "landscape" ? w.width : w.height;
                const wordHeight = direction === "landscape" ? w.height : w.width;

                if (nextY < 0 || nextX < 0 ||
                    (nextX + wordWidth) >= width || (nextY + wordHeight) >= height ||
                    visited.has(`${nextX},${nextY}`)) {
                    continue;
                }

                visited.add(`${nextX},${nextY}`);

                const isEmpty = isEmptyArea(imageData, direction, fgColor, nextX, nextY, w.width, w.height, markingColor);
                if (isEmpty) {
                    return {x: nextX, y: nextY};
                } else {
                    queue.push({x: nextX, y: nextY});
                }
            }
        }
    }
}


//중간점을 기준으로 사방탐색, 직사각형
function isEmptyArea(imageData,
                     direction,
                     fgColor,
                     x, y, w, h,
                     markingColor) {
    const {data, width} = imageData;
    const dw = direction === "landscape" ? w : h;
    const dh = direction === "landscape" ? h : w;
    for (let dx = Math.floor(x - dw / 2); dx < Math.floor(x + dw / 2); dx++) {
        for (let dy = Math.floor(y - dh / 2); dy < Math.floor(y + dh / 2); dy++) {
            const idx = dx * 4 + (width * 4 * dy);
            const sumRgb = data[idx] + data[idx + 1] + data[idx + 2] + data[idx + 3];
            if (sumRgb != fgColor || sumRgb === markingColor) {
                return false;
            }
        }
    }
    return true;
}

