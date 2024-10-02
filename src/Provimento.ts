type IProvimento = {
    Descricao: string;
    Valor: number;
};


const convertParenthesesToNumber = (value) => {
    const match = value.match(/\(([^)]+)\)/);
    if (match) {
        const num = parseFloat(match[1].replace('.', '').replace(',', '.'));
        return -num
    }
    return value
}
export const extractProviment = (text: string): { typeReclamante: IProvimento[], typeReclamado: IProvimento[] } => {
    const beginWord = "VERBAS";
    const endWord = "Critério de Cálculo e Fundamentação Legal";
    const stopToggle = "Líquido Devido ao Reclamante"

    const tableArray: Array<any> = text.replace(/\n/g, '|')
        .replace(/ {3,}/g, '').split('|').filter(v => v.trim() !== "").map(v => {
            const trimmedValue = v.trim()

            const num = parseFloat(v.trim().replace('.', '').replace(',', '.'));
            if (isNaN(num)) {
                return convertParenthesesToNumber(trimmedValue);
            } else {
                return num
            }

        });
    const initialIndex = tableArray.indexOf(beginWord);
    const endIndex = tableArray.findIndex(item => item.toString().trim().toLocaleLowerCase().includes(endWord.toLocaleLowerCase()));
    const x = tableArray.slice(initialIndex, endIndex);

    const finalArray: Array<[string, number]> = [];

    let tempArray: [string, number] | null = null;

    x.forEach((item, index) => {
        if (typeof item === 'string' && (index + 1 < x.length) && typeof x[index + 1] === 'number') {
            tempArray = [item, x[index + 1] as number];
            finalArray.push(tempArray);
        }
    });
    // Adicionar alternancia a cada dois elementos para separa-los em dois arrays para as tabelas.
    const typeReclamante: IProvimento[] = [];
    const typeReclamado: IProvimento[] = [];
    let toggle = true;
    let stopToggleFound = false;

    finalArray.forEach((item, index) => {
        const provimento: IProvimento = {
            Descricao: item[0],
            Valor: item[1]
        }

        if (provimento.Descricao.includes(stopToggle)) {
            stopToggleFound = true;
        }
        if (!stopToggleFound) {
            if (index % 2 < 1) {
                typeReclamante.push(provimento)
            } else {
                typeReclamado.push(provimento)
            }
        } else {
            typeReclamante.push(provimento)
        }

    });
    // Método sem separar tabela
    // const y: IProvimento[] = finalArray.map(f => ({
    //     Descricao: f[0],
    //     Valor: f[1]
    // }));

    return { typeReclamante, typeReclamado };
}
