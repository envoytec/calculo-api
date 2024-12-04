
const convertParenthesesToNumber = (value) => {
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



type IResumoCalculo = {
    descricao: string,
    valorCorrigido: number,
    juros: number,
    total: number,
    valores: Array<number>
}

export const extractResume = (text) => {

    const beginWord = "Total";
    const endWord = "Percentual de Parcelas Remuneratórias";
    const blackListWord = [
        "Cálculo liquidado por offline na versão",
        "Pág.",
    ];

    const tableArray: Array<any> = text.replaceAll(/\n/g, '|')
        .replaceAll('   ', '')
        .split('|')
        .filter(v => v.trim() !== "" && blackListWord.findIndex(bw => v.includes(bw)) === -1).map(v => {
            const trimmedValue = v.trim()

            if (!isNaN(trimmedValue.replace(/\./g, '')
                .replace(/\,/g, '.') * 1)) {
                return v.trim()
                .replace(/\./g, '')
                .replace(/\,/g, '.') * 1
            }
            else {
                return convertParenthesesToNumber(trimmedValue);
            }
        });

    const initialIndex = tableArray.indexOf(beginWord) + 1;
    const endIndex = tableArray
        .findIndex(item => item
            .toString()
            .trim()
            .toLocaleLowerCase()
            .includes(endWord
                .toLocaleLowerCase()));

    const x = tableArray.splice(initialIndex, endIndex - initialIndex);
    const finalArray = [];

    x.forEach(item => {
        if (typeof item === "string") {
            finalArray.push({
                descricao: item,
                valores: [],
            });
        }

        if (typeof item === "number") {
            finalArray[finalArray.length - 1].valores.push(item);
        }
    });
    const y: IResumoCalculo[] = finalArray.map(f => {
        if (f.valores.length > 2) {
            f.valorCorrigido = f.valores[0];
            f.juros = f.valores[1];
            f.total = f.valores[2];
        }
        return f;
    }).filter(f => f.valores.length > 2);
    console.log(y)
    return y;
}