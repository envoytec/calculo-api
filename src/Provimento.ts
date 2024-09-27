type IProvimento = {
  Descricao: string;
  Valor: number;
};

export const extractProviment = (text: string): IProvimento[] => {
  const beginWord = "Percentual de Parcelas Remuneratórias";
  const endWord = "Critério de Cálculo e Fundamentação Legal";

  const tableArray: Array<any> = text.replace(/\n/g, '|')
    .replace(/ {3,}/g, '')
    .split('|')
    .filter(v => v.trim() !== "").map(v => {
      const num = parseFloat(v.trim().replace('.', '').replace(',', '.'));
      return isNaN(num) ? v.trim() : num;
    });

  const initialIndex = tableArray.indexOf(beginWord) + 1;
  const endIndex = tableArray.findIndex(item => item.toString().trim().toLocaleLowerCase().includes(endWord.toLocaleLowerCase()));
  const x = tableArray.slice(initialIndex, endIndex);
  const finalArray: Array<[string, number]> = [];

  let tempArray: [string, number] | null = null;
  
  x.forEach((item, index) => {
    if (typeof item === 'string' && (index + 1 < x.length) && typeof x[index + 1] === 'number') {
      tempArray = [item, x[index + 1] as number];
      finalArray.push(tempArray);
      tempArray = null;
    }
  });

  const y: IProvimento[] = finalArray.map(f => ({
    Descricao: f[0],
    Valor: f[1]
  }));
  console.log("teste extract", y)
  return y;
};