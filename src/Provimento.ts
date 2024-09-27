export const extractResume = (text) => {
    const beginWord = "Percentual de Parcelas Remuneratórias";
    const endWord = "Critério de Cálculo e Fundamentação Legal";

    const tableArray: Array<any> = text.replaceAll(/\n/g, '|')
        .replaceAll('   ', '')
        .split('|')
        .filter(v => v.trim() !== "").map(v => {
            if (!isNaN(v.trim().replace('.', '').replace(',', '.') * 1)) {
                return v.trim().replace('.', '').replace(',', '.') * 1
            } else {
                return v.trim();
            }
        });

    const initialIndex = tableArray.indexOf(beginWord) + 1;
    const endIndex = tableArray.findIndex(item => item.toString().trim().toLocaleLowerCase().includes(endWord.toLocaleLowerCase()));
    const x = tableArray.splice(initialIndex, endIndex - initialIndex);
    const finalArray = [];

    let tempArray = [];
    
    x.forEach((item, index) => {
        if(typeof item === 'string' && (index + 1 < x.length) && typeof x[index+1] === 'number'){
            tempArray.push(item);
            tempArray.push(x[index + 1]);
            finalArray.push(tempArray);
            tempArray = [];
        }
        return finalArray;
    }) 
}