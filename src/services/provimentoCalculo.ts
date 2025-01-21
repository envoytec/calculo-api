
type IProvimento = {
    Descricao: string;
    Valor: number;
    Tipo?: string;
};

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

export const extractProviment = (text: string): IProvimento[] => {
    const beginWord = "VERBAS";
    const beginWordSub = "Descrição de Créditos e Descontos do Reclamante";
    const endWord = "Critério de Cálculo e Fundamentação Legal";
    const stopToggle = "Líquido Devido ao Reclamante";
    const newDescription = "Descrição de Débitos do Reclamante";
    const referenceEndDescription = "Total Devido pelo Reclamante";
    const verbasNaoPrincipal = "Verbas que não compõem o Principal"

    // Regex para remover textos como "Pág. 1 de 25"
    const removePaginationText = /Pág\.\s*\d+\s*de\s*\d+/g;


    const cleanedText = text.replace(removePaginationText, '');

    const tableArray: Array<any> = cleanedText.replace(/\n/g, '|')
        .replace(/ {3,}/g, '')
        .split('|')
        .filter(v => v.trim() !== "")
        .map(v => {
            const trimmedValue = v.trim()

            const num = parseFloat(v.trim()
                .replace(/\./g, '')
                .replace(/\,/g, '.'));
            if (isNaN(num)) {
                return convertParenthesesToNumber(trimmedValue);
            } else {
                return num
            }

        });
    const initialIndex = tableArray.indexOf(beginWord);
    const initialIndexSub = tableArray.indexOf(beginWordSub)
    const endNewDescription = tableArray.indexOf(newDescription)


    const endIndex = tableArray
        .findIndex(item => item
            .toString().
            trim()
            .toLocaleLowerCase()
            .includes(endWord.toLocaleLowerCase()));

    const startIndex = initialIndex !== -1 ? initialIndex : initialIndexSub;
    if (startIndex === -1) {
        return [];
    }
    const x = tableArray.slice(startIndex, endIndex);
    const finalArray: Array<[string, number]> = [];
    let tempArray: [string, number] | null = null;

    x.forEach((item, index) => {
        if (typeof item === 'string' && (index + 1 < x.length) && typeof x[index + 1] === 'number') {
            tempArray = [item, x[index + 1] as number];
            finalArray.push(tempArray);
        }
    });
    // Adicionar alternancia a cada dois elementos para separa-los em dois arrays para as tabelas.
    const provimentoArr: IProvimento[] = [];
   
    let stopToggleFound = false;
    let verbasNaoPrincipalFound = false


    finalArray.forEach((item, index) => {
        const provimento: IProvimento = {
            Descricao: item[0],
            Valor: item[1]
        }

        if (provimento.Descricao.includes(stopToggle) && !stopToggleFound) {
            stopToggleFound = true;
            provimento.Tipo = "reclamante"
            
        } else if (!stopToggleFound) {
            provimento.Tipo = index % 2 < 1 ? "reclamante" : "reclamada"

        } else if (provimento.Descricao.includes(verbasNaoPrincipal) && !verbasNaoPrincipalFound) {
            verbasNaoPrincipalFound = true;
            provimento.Tipo = "verbas nao principal";

        } else if (verbasNaoPrincipalFound) {
            provimento.Tipo = "verbas_nao_principal"
        } else {
            return
        }
        provimentoArr.push(provimento)
    });

    //Verificação dos itens entre stoptoggle e endNewDescription para definir como tipo " reclamada "
    if (stopToggleFound && endNewDescription !== -1) {
        const itemsBetweenStoptoggleAndEnd = tableArray.slice(tableArray.indexOf(stopToggle) + 1, endNewDescription)
        itemsBetweenStoptoggleAndEnd.forEach((item, index) => {
            if (typeof item === "string" && (index + 1 < itemsBetweenStoptoggleAndEnd.length) && typeof itemsBetweenStoptoggleAndEnd[index + 1] === "number") {
                const itemProvimento: IProvimento = {
                    Descricao: item,
                    Valor: itemsBetweenStoptoggleAndEnd[index + 1] as number,
                    Tipo: "reclamada"
                }
                provimentoArr.push(itemProvimento)
            }
        })
    }

    // Processamento adicional para o restante dos itens
    if (stopToggleFound && endNewDescription !== -1) {
        const additionalItems = tableArray.slice(endNewDescription, endIndex);
        additionalItems.forEach((item, index) => {
            if (typeof item === 'string' && (index + 1 < additionalItems.length) && typeof additionalItems[index + 1] === 'number') {
                const additionalProvimento: IProvimento = {
                    Descricao: item,
                    Valor: additionalItems[index + 1] as number,
                    Tipo: "reclamante"
                };
                provimentoArr.push(additionalProvimento);
            }
        });
    } else {
        const remainingItems = tableArray.slice(tableArray.indexOf(stopToggle) + 1, endIndex)
        remainingItems.forEach((item, index) => {
            if (typeof item === "string" && (index + 1 < remainingItems.length) && typeof remainingItems[index + 1] === "number") {
                const remaingProvimento: IProvimento = {
                    Descricao: item,
                    Valor: remainingItems[index + 1] as number,
                    Tipo: "reclamada"
                }
                provimentoArr.push(remaingProvimento)
            }
        })
    }

    console.log(provimentoArr)
    return provimentoArr;
}