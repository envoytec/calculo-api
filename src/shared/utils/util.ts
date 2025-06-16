
export const searchPattern = (text, input) => {
  return text.indexOf(input);
}


/**
 * 
 * @param text
 * @param startWord
 * @param endWord
 * @constant Função para extrair texto entre duas palavras
 * @returns texto extraído
 */
export const extractBetween = (text, startWord, endWord) => {
  const startWordLength = startWord.length;
  let extractedText = text.substr(searchPattern(text, startWord) + startWordLength, searchPattern(text, endWord) - searchPattern(text, startWord) - startWordLength);
  return extractedText.trim();
}

export const dateFromPtToEn = (dateString: any) => {
  const match = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) {
      const [_, day, month, year] = match; 
      return `${year}-${month}-${day} 00:00:00`;
  }
  return null;
}

