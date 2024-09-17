import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDatabase, ref, get, child } from "firebase/database";

export const exportDataToExcel = async () => {
  const db = getDatabase();
  const dbRef = ref(db);

  try {
    // Obtém os dados dos eventos, brindes e códigos utilizados do Firebase
    const snapshot = await get(child(dbRef, 'eventos'));
    if (!snapshot.exists()) {
      throw new Error('Nenhum dado encontrado');
    }

    const eventos = snapshot.val();

    // Preparando os dados para as planilhas
    const eventosArray = [];
    const brindesArray = [];
    const codigosArray = [];

    Object.keys(eventos).forEach(eventId => {
      const event = eventos[eventId];

      // Adiciona os eventos
      eventosArray.push({
        "Evento ID": eventId,
        "Nome": event.name,
        "Título": event.title
      });

      // Adiciona os brindes associados ao evento
      if (event.gifts) {
        Object.keys(event.gifts).forEach(giftId => {
          const gift = event.gifts[giftId];
          brindesArray.push({
            "Brinde ID": giftId,
            "Evento ID": eventId,
            "Título": gift.title,
            "Descrição": gift.description,
            "Quantidade": gift.amount,
            "URL da Imagem": gift.imageUri
          });
        });
      }

      // Adiciona os códigos utilizados associados ao evento
      if (event.codigosUtilizados) {
        Object.keys(event.codigosUtilizados).forEach(codigoId => {
          const codigo = event.codigosUtilizados[codigoId];
          codigosArray.push({
            "Código ID": codigoId,
            "Evento ID": eventId,
            "Código": codigo.codigo,
            "Data/Hora": codigo.dataHora
          });
        });
      }
    });

    // Cria as planilhas para eventos, brindes e códigos utilizados
    const eventosSheet = XLSX.utils.json_to_sheet(eventosArray);
    const brindesSheet = XLSX.utils.json_to_sheet(brindesArray);
    const codigosSheet = XLSX.utils.json_to_sheet(codigosArray);

    // Ajusta a largura das colunas
    eventosSheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 30 }];
    brindesSheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 50 }, { wch: 10 }, { wch: 60 }];
    codigosSheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 60 }, { wch: 25 }];

    // Cria o workbook e adiciona as planilhas
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, eventosSheet, 'Eventos');
    XLSX.utils.book_append_sheet(workbook, brindesSheet, 'Brindes');
    XLSX.utils.book_append_sheet(workbook, codigosSheet, 'Códigos Utilizados');

    // Converte para buffer e salva no dispositivo
    const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
    const uri = FileSystem.documentDirectory + 'eventos_brindes_codigos.xlsx';
    await FileSystem.writeAsStringAsync(uri, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Compartilha o arquivo
    await Sharing.shareAsync(uri);
    return true;

  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    return false;
  }
};
