

export const convertParenthesesToNumber = (value) => {
    const match = value.match(/\(([^)]+)\)/);
    const endsWithNumberOrPorcent = /\(\s*\d+(\.\d+)?\s*%\s*\)/.test(value.trim());
    if (match && !endsWithNumberOrPorcent) {
        const num = parseFloat(match[1].replace('.', '').replace(',', '.'));
        if (isNaN(num)) {
            return value;
        }
        return -num
    }
    return value
}

