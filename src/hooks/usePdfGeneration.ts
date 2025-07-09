
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const usePdfGeneration = () => {
  const generatePdf = useCallback(async (element: HTMLElement, fileName: string) => {
    try {
      // Configurações para melhor qualidade
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        height: element.scrollHeight,
        width: element.scrollWidth
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Criar PDF em formato A4
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Margens para aproveitar melhor a página
      const margin = 10;
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      
      // Calcular dimensões mantendo proporção
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Usar toda a largura disponível
      const ratio = availableWidth / imgWidth;
      const finalWidth = availableWidth;
      const finalHeight = imgHeight * ratio;
      
      // Posicionar com margem
      const x = margin;
      const y = margin;
      
      // Se a imagem for muito alta, dividir em páginas de forma mais inteligente
      if (finalHeight > availableHeight) {
        let currentY = 0;
        let pageCount = 0;
        
        // Calcular quantas páginas serão necessárias
        const totalPages = Math.ceil(finalHeight / availableHeight);
        
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage();
          }
          
          // Calcular a altura da seção que cabe nesta página
          const remainingHeight = finalHeight - currentY;
          const currentPageHeight = Math.min(availableHeight, remainingHeight);
          
          // Calcular a posição Y no canvas original
          const sourceY = (currentY / finalHeight) * imgHeight;
          const sourceHeight = (currentPageHeight / finalHeight) * imgHeight;
          
          // Adicionar a imagem com offset negativo para mostrar a parte correta
          pdf.addImage(
            imgData,
            'PNG',
            x,
            y - (currentY * ratio),
            finalWidth,
            finalHeight,
            undefined,
            'FAST'
          );
          
          // Para páginas intermediárias, adicionar uma máscara branca para cobrir o conteúdo
          // que não deveria aparecer nesta página
          if (page < totalPages - 1) {
            // Cobrir a parte de baixo
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, y + currentPageHeight, pdfWidth, pdfHeight - (y + currentPageHeight), 'F');
          }
          
          if (page > 0) {
            // Cobrir a parte de cima
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pdfWidth, y, 'F');
          }
          
          currentY += currentPageHeight;
        }
      } else {
        // Se cabe em uma página, centralizar verticalmente
        const verticalOffset = (availableHeight - finalHeight) / 2;
        pdf.addImage(
          imgData, 
          'PNG', 
          x, 
          y + verticalOffset, 
          finalWidth, 
          finalHeight, 
          undefined, 
          'FAST'
        );
      }
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar o PDF');
    }
  }, []);

  return { generatePdf };
};
