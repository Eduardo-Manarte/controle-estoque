import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Switch, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import DateTimePicker from '@react-native-community/datetimepicker';
import { globalStyles, colors } from '../styles/globalStyles';

const AppIcon = require('../../assets/icon.png');

export default function RelatorioModal({ visible, onClose, produtos }) {
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [incluirMovs, setIncluirMovs] = useState(false);
  const [filtroAtual, setFiltroAtual] = useState('todos');
  const [loading, setLoading] = useState(false);

  const resetarTudo = () => {
    setDataInicio(null);
    setDataFim(null);
    setIncluirMovs(false);
    setFiltroAtual('todos');
  };

  const fmtData = (dt) => dt?.toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR');

  const mudaData = (tipo, event, novaData) => {
    const platform = event?.type;
    if (platform === 'dismissed') return;
    
    if (tipo === 'start') {
      setShowStartPicker(false);
      novaData && setDataInicio(novaData);
    } else {
      setShowEndPicker(false);
      novaData && setDataFim(novaData);
    }
  };

  const filtraProdutos = () => {
    if (filtroAtual === 'baixo') {
      return produtos.filter(p => p.quantidade <= p.quantidadeMinima && p.quantidade > 0);
    }
    if (filtroAtual === 'zerado') {
      return produtos.filter(p => p.quantidade === 0);
    }
    return produtos;
  };

  const buscaMovimentacoes = async () => {
    try {
      const [ent, sai] = await Promise.all([
        AsyncStorage.getItem('entradas'),
        AsyncStorage.getItem('saidas')
      ]);

      let movs = [];
      
      if (ent) {
        const entradas = JSON.parse(ent);
        movs = movs.concat(entradas.map(e => ({ 
          ...e, 
          tipoMov: 'entrada', 
          dtMov: new Date(e.data),
          obs: e.observacao || e.observacoes || e.obs || ''
        })));
      }
      
      if (sai) {
        const saidas = JSON.parse(sai);
        movs = movs.concat(saidas.map(s => ({ 
          ...s, 
          tipoMov: 'saida', 
          dtMov: new Date(s.data),
          obs: s.observacao || s.observacoes || s.obs || ''
        })));
      }

      if (dataInicio || dataFim) {
        const ini = dataInicio ? new Date(dataInicio.getTime()) : new Date('2000-01-01');
        const fim = dataFim ? new Date(dataFim.getTime()) : new Date();
        
        ini.setHours(0, 0, 0, 0);
        fim.setHours(23, 59, 59, 999);
        
        movs = movs.filter(m => {
          const dt = new Date(m.dtMov);
          return dt >= ini && dt <= fim;
        });
      }

      return movs.sort((a, b) => new Date(b.dtMov) - new Date(a.dtMov));
    } catch (err) {
      console.warn('Falha ao buscar movimentações:', err);
      Alert.alert('Ops', 'Ocorreu um erro durante o carregando das movimentações');
      return [];
    }
  };

  const montaHTML = (prods, movs) => {
    const hoje = new Date();
    const dtHoje = hoje.toLocaleDateString('pt-BR');
    const hrHoje = hoje.toLocaleTimeString('pt-BR').substring(0, 5);
    
    let periodo = 'Período completo';
    if (dataInicio || dataFim) {
      periodo = `${fmtData(dataInicio)} até ${fmtData(dataFim)}`;
    }
    
    const labelFiltros = {
      'todos': 'Todos',
      'baixo': 'Estoque baixo',
      'zerado': 'Zerados'
    };

    const stats = {
      total: prods.length,
      ok: prods.filter(p => p.quantidade > p.quantidadeMinima).length,
      baixo: prods.filter(p => p.quantidade <= p.quantidadeMinima && p.quantidade > 0).length,
      zero: prods.filter(p => p.quantidade === 0).length,
      valor: prods.reduce((acc, p) => acc + (p.quantidade * (p.custo || 0)), 0)
    };

    const logoUri = Image.resolveAssetSource(AppIcon).uri;

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: system-ui, -apple-system, sans-serif; 
            margin: 12px; 
            font-size: 10px; 
            color: #333;
            line-height: 1.3;
        }
        .header { 
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center; 
            margin-bottom: 20px; 
            border-bottom: 3px solid #007bff; 
            padding-bottom: 12px;
            position: relative;
        }
        .logo { 
            position: absolute;
            left: 0;
            width: 70px; 
            height: 70px; 
            border-radius: 8px;
        }
        .title-area h1 { 
            margin: 0 0 4px 0;
            font-size: 18px; 
            color: #007bff; 
        }
        .title-area h2 { 
            margin: 0 0 6px 0;
            font-size: 12px; 
            font-weight: normal;
            color: #666;
        }
        .meta { 
            font-size: 9px; 
            color: #888; 
        }
        .section { 
            margin: 16px 0; 
        }
        .section h3 { 
            font-size: 12px; 
            margin: 0 0 8px 0; 
            color: #444; 
            border-bottom: 1px solid #eee; 
            padding-bottom: 3px; 
        }
        .summary { 
            background: #f8f9fa; 
            padding: 8px 12px; 
            border-radius: 4px; 
            margin-bottom: 12px;
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
        }
        .stat { 
            font-size: 9px;
        }
        .stat strong { 
            display: block;
            font-size: 11px;
            color: #333;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 12px;
            font-size: 9px;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 3px 5px; 
            text-align: left; 
        }
        th { 
            background: #f1f3f4; 
            font-weight: 600;
            font-size: 8px;
            text-transform: uppercase;
        }
        .ok { color: #28a745; font-weight: 600; }
        .low { color: #fd7e14; font-weight: 600; }
        .out { color: #dc3545; font-weight: 600; }
        .entry { color: #28a745; }
        .exit { color: #dc3545; }
        .no-data { 
            text-align: center; 
            padding: 20px; 
            color: #999; 
            font-style: italic;
        }
        .footer { 
            margin-top: 20px;
            text-align: center; 
            font-size: 7px; 
            color: #aaa; 
            border-top: 1px solid #eee; 
            padding-top: 6px; 
        }
        tbody tr:hover { background: #f9f9f9; }
        .currency { text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <img src="${logoUri}" alt="Logo" class="logo" />
        <div class="title-area">
            <h1>Controle de Estoque</h1>
            <h2>Relatório de Inventário</h2>
            <div class="meta">
                ${dtHoje} • ${hrHoje}<br>
                ${periodo} • ${labelFiltros[filtroAtual]}
            </div>
        </div>
    </div>

    <div class="section">
        <h3>📊 Resumo</h3>
        <div class="summary">
            <div class="stat">
                <strong>${stats.total}</strong>
                Produtos
            </div>
            <div class="stat">
                <strong>${stats.ok}</strong>
                OK
            </div>
            <div class="stat">
                <strong>${stats.baixo}</strong>
                Baixo
            </div>
            <div class="stat">
                <strong>${stats.zero}</strong>
                Zerado
            </div>
            <div class="stat">
                <strong>R$ ${stats.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
                Valor Total
            </div>
            ${incluirMovs ? `<div class="stat"><strong>${movs.length}</strong>Movimentações</div>` : ''}
        </div>
    </div>

    <div class="section">
        <h3>📦 Produtos</h3>
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Atual</th>
                    <th>Mín</th>
                    <th>Status</th>
                    <th>Custo</th>
                    <th>Venda</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${prods.map(p => {
                  const qtd = p.quantidade || 0;
                  const min = p.quantidadeMinima || 0;
                  
                  let st, cls;
                  if (qtd === 0) {
                    st = 'ZERADO'; cls = 'out';
                  } else if (qtd <= min) {
                    st = 'BAIXO'; cls = 'low';
                  } else {
                    st = 'OK'; cls = 'ok';
                  }
                  
                  const vlrEstoque = qtd * (p.custo || 0);
                  
                  return `<tr>
                    <td>${p.nome || 'S/ nome'}</td>
                    <td>${qtd}</td>
                    <td>${min}</td>
                    <td class="${cls}">${st}</td>
                    <td class="currency">R$ ${(p.custo || 0).toFixed(2)}</td>
                    <td class="currency">R$ ${(p.venda || 0).toFixed(2)}</td>
                    <td class="currency">R$ ${vlrEstoque.toFixed(2)}</td>
                  </tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>

    ${incluirMovs ? `
    <div class="section">
        <h3>📈 Movimentações (${movs.length})</h3>
        ${movs.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Obs</th>
                </tr>
            </thead>
            <tbody>
                ${movs.map(m => {
                  const prod = produtos.find(p => p.id === m.produtoId);
                  const nomeProd = prod?.nome || `ID ${m.produtoId}`;
                  const tipoClass = m.tipoMov === 'entrada' ? 'entry' : 'exit';
                  const tipoTxt = m.tipoMov === 'entrada' ? '↑ ENT' : '↓ SAI';
                  const dt = m.dtMov ? new Date(m.dtMov).toLocaleDateString('pt-BR') : '-';
                  
                  return `<tr>
                    <td>${dt}</td>
                    <td class="${tipoClass}">${tipoTxt}</td>
                    <td>${nomeProd}</td>
                    <td>${m.quantidade || 0}</td>
                    <td>${m.obs || '-'}</td>
                  </tr>`;
                }).join('')}
            </tbody>
        </table>
        ` : '<div class="no-data">Sem movimentações no período</div>'}
    </div>
    ` : ''}

    <div class="footer">
        Gerado automaticamente • ${dtHoje}
    </div>
</body>
</html>`;
  };

  const criarRelatorio = async () => {
    setLoading(true);
    
    try {
      const prodsFiltrados = filtraProdutos();
      
      if (!prodsFiltrados.length) {
        Alert.alert('Ops!', 'Nenhum produto encontrado.');
        return;
      }

      let movimentacoes = [];
      if (incluirMovs) {
        movimentacoes = await buscaMovimentacoes();
      }
      
      const htmlContent = montaHTML(prodsFiltrados, movimentacoes);
      const resultado = await Print.printToFileAsync({ 
        html: htmlContent, 
        base64: false 
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(resultado.uri, { 
          mimeType: 'application/pdf', 
          dialogTitle: 'Compartilhar Relatório' 
        });
      } else {
        Alert.alert('Pronto!', 'Relatório criado!');
      }

      onClose();
      resetarTudo();
      
    } catch (e) {
      console.error('Erro no relatório:', e);
      Alert.alert('Erro', 'Falha ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const fechar = () => {
    resetarTudo();
    onClose();
  };

  const opcoesFiltro = [
    { id: 'todos', nome: 'Todos os produtos' },
    { id: 'baixo', nome: 'Estoque baixo' },
    { id: 'zerado', nome: 'Produtos zerados' }
  ];

  return (
    <Modal 
      isVisible={visible} 
      onBackdropPress={fechar} 
      style={globalStyles.modal} 
      animationIn="slideInUp" 
      animationOut="slideOutDown"
    >
      <View style={[globalStyles.modalContent, { maxHeight: '90%' }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={globalStyles.modalTitle}>Relatório</Text>

          <Text style={globalStyles.modalLabel}>Período</Text>
          
          <TouchableOpacity 
            style={styles.dateBtn} 
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.dateTxt}>
              {dataInicio ? `De: ${fmtData(dataInicio)}` : 'Data inicial'}
            </Text>
            {dataInicio && (
              <TouchableOpacity onPress={() => setDataInicio(null)}>
                <Ionicons name="close-circle" size={20} color="#e74c3c" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dateBtn} 
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.dateTxt}>
              {dataFim ? `Até: ${fmtData(dataFim)}` : 'Data final'}
            </Text>
            {dataFim && (
              <TouchableOpacity onPress={() => setDataFim(null)}>
                <Ionicons name="close-circle" size={20} color="#e74c3c" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={dataInicio || new Date()}
              mode="date"
              display="default"
              onChange={(e, d) => mudaData('start', e, d)}
              maximumDate={new Date()}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={dataFim || new Date()}
              mode="date"
              display="default"
              onChange={(e, d) => mudaData('end', e, d)}
              maximumDate={new Date()}
              minimumDate={dataInicio}
            />
          )}

          <Text style={globalStyles.modalLabel}>Filtros</Text>
          
          {opcoesFiltro.map(opcao => (
            <TouchableOpacity
              key={opcao.id}
              style={[styles.filterBtn, filtroAtual === opcao.id && styles.filterActive]}
              onPress={() => setFiltroAtual(opcao.id)}
            >
              <Ionicons 
                name={filtroAtual === opcao.id ? 'radio-button-on' : 'radio-button-off'} 
                size={20} 
                color={filtroAtual === opcao.id ? colors.primary : '#666'} 
              />
              <Text style={[styles.filterTxt, filtroAtual === opcao.id && styles.filterTxtActive]}>
                {opcao.nome}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.switchRow}>
            <Text style={globalStyles.modalLabel}>Incluir movimentações</Text>
            <Switch 
              value={incluirMovs} 
              onValueChange={setIncluirMovs}
              trackColor={{ false: '#ccc', true: colors.primary + '88' }}
              thumbColor="#fff"
            />
          </View>

          <View style={globalStyles.modalButtons}>
            <TouchableOpacity 
              style={[globalStyles.modalButton, globalStyles.modalCancelButton]} 
              onPress={fechar}
            >
              <Text style={globalStyles.modalCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                globalStyles.modalButton, 
                globalStyles.modalSaveButton,
                loading && { opacity: 0.5 }
              ]}
              onPress={criarRelatorio}
              disabled={loading}
            >
              <Text style={globalStyles.modalSaveButtonText}>
                {loading ? 'Gerando...' : 'Gerar PDF'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = {
  dateBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f9f9f9', 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 6, 
    padding: 12, 
    marginBottom: 8 
  },
  dateTxt: { 
    flex: 1, 
    marginLeft: 8, 
    fontSize: 15, 
    color: colors.text 
  },
  filterBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 12, 
    borderRadius: 6, 
    marginBottom: 4 
  },
  filterActive: { 
    backgroundColor: colors.primary + '22' 
  },
  filterTxt: { 
    marginLeft: 10, 
    fontSize: 15, 
    color: '#555' 
  },
  filterTxtActive: { 
    color: colors.primary, 
    fontWeight: '500' 
  },
  switchRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginVertical: 16,
    paddingVertical: 4
  }
};