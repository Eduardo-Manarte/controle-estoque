import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

import { globalStyles, colors } from '../styles/globalStyles';
import { estoqueStyles } from '../styles/estoqueStyles';
import RelatorioModal from '../utils/RelatorioModal'; // Importar o novo componente

const EstoqueScreen = () => {
  const [produtos, setProdutos] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRelatorioModal, setShowRelatorioModal] = useState(false); // Novo estado
  const [editingProduct, setEditingProduct] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: '',
    quantidadeMinima: '',
    custo: '',
    venda: '',
    foto: null,
  });

  useEffect(() => {
    loadStuff();
  }, []);

  // carrega dados quando entra na tela
  useFocusEffect(
    React.useCallback(() => {
      loadStuff();
    }, [])
  );

  // função pra carregar os dados
  const loadStuff = async () => {
    setLoading(true);
    try {
      const storedProdutos = await AsyncStorage.getItem('produtos');
      if (storedProdutos) {
        setProdutos(JSON.parse(storedProdutos));
      }
    } catch (error) {
      console.log('erro ao carregar produtos:', error);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStuff();
    setIsRefreshing(false);
  };

  const saveProdutos = async (newProdutos) => {
    try {
      await AsyncStorage.setItem('produtos', JSON.stringify(newProdutos));
      setProdutos(newProdutos);
    } catch (error) {
      console.log('erro save:', error);
    }
  };

  const getStatusColor = (quantidade, quantidadeMinima) => {
    if (quantidade === 0) return colors.danger;
    if (quantidade <= quantidadeMinima) return colors.warning;
    return colors.success;
  };

  // filtro
  const filteredData = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = () => {
    setEditingProduct(null);
    // reset form
    setFormData({
      nome: '',
      quantidade: '',
      quantidadeMinima: '',
      custo: '',
      venda: '',
      foto: null,
    });
    setShowModal(true);
  };

  const openEditModal = (produto) => {
    setEditingProduct(produto);
    setFormData({
      nome: produto.nome,
      quantidade: produto.quantidade.toString(),
      quantidadeMinima: produto.quantidadeMinima ? produto.quantidadeMinima.toString() : '',
      custo: produto.custo.toString(),
      venda: produto.venda.toString(),
      foto: produto.foto,
    });
    setShowModal(true);
  };

  const pickImage = async () => {
    Alert.alert(
      'Selecionar Foto',
      'Escolha uma opção',
      [
        { text: 'Câmera', onPress: openCamera },
        { text: 'Galeria', onPress: openGallery },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ops!', 'Permissão de câmera necessária!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFormData({ ...formData, foto: result.assets[0].uri });
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFormData({ ...formData, foto: result.assets[0].uri });
    }
  };

  const handleSave = () => {
    // validações básicas
    if (!formData.nome || !formData.quantidade || !formData.custo || !formData.venda) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const produto = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      nome: formData.nome,
      quantidade: parseInt(formData.quantidade),
      quantidadeMinima: formData.quantidadeMinima ? parseInt(formData.quantidadeMinima) : 0,
      custo: parseFloat(formData.custo),
      venda: parseFloat(formData.venda),
      foto: formData.foto,
      dataCadastro: editingProduct ? editingProduct.dataCadastro : new Date().toISOString(),
    };

    let newProdutos;
    if (editingProduct) {
      newProdutos = produtos.map(p => p.id === editingProduct.id ? produto : p);
    } else {
      newProdutos = [...produtos, produto];
    }

    saveProdutos(newProdutos);
    setShowModal(false);
  };

  const handleDelete = (produto) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o produto "${produto.nome}"?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: () => {
            const newProdutos = produtos.filter(p => p.id !== produto.id);
            saveProdutos(newProdutos);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={estoqueStyles.produtoCard}>
      <View style={globalStyles.imageContainer}>
        {item.foto ? (
          <Image source={{ uri: item.foto }} style={globalStyles.image} />
        ) : (
          <View style={globalStyles.noImagePlaceholder}>
            <Ionicons name="image-outline" size={30} color={colors.placeholder} />
          </View>
        )}
      </View>
      
      <View style={estoqueStyles.produtoInfo}>
        <Text style={estoqueStyles.produtoNome}>{item.nome}</Text>
        <Text style={estoqueStyles.produtoPreco}>R$ {item.venda.toFixed(2)}</Text>
        <Text style={estoqueStyles.produtoCusto}>Custo: R$ {item.custo.toFixed(2)}</Text>
        {item.quantidadeMinima > 0 && (
          <Text style={estoqueStyles.produtoMinimo}>Mín: {item.quantidadeMinima}</Text>
        )}
      </View>

      <View style={estoqueStyles.produtoActions}>
        <View
          style={[
            estoqueStyles.quantidadeBadge,
            { backgroundColor: getStatusColor(item.quantidade, item.quantidadeMinima) },
          ]}
        >
          <Text style={estoqueStyles.quantidadeText}>{item.quantidade}</Text>
        </View>
        
        <View style={estoqueStyles.actionButtons}>
          <TouchableOpacity
            style={estoqueStyles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={estoqueStyles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // loading
  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Ionicons name="hourglass-outline" size={40} color="#4CAF50" />
        <Text style={globalStyles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.header}>
        <View style={globalStyles.headerSearchContainer}>
          <Ionicons name="search" size={20} color="#666" style={globalStyles.searchIcon} />
          <TextInput
            style={globalStyles.searchInput}
            placeholder="Buscar..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={globalStyles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#4CAF50" />
        </TouchableOpacity>
        {/* Novo botão de relatório */}
        <TouchableOpacity 
          style={[globalStyles.refreshButton, { marginLeft: 8 }]} 
          onPress={() => setShowRelatorioModal(true)}
        >
          <Ionicons name="document-text" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={globalStyles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
          />
        }
        ListEmptyComponent={
          <View style={globalStyles.emptyContainer}>
            <Ionicons name="cube-outline" size={60} color="#ccc" />
            <Text style={globalStyles.emptyText}>
              {search ? 'Nenhum resultado' : 'Nenhum produto cadastrado'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity style={globalStyles.fab} onPress={openModal}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal de Relatório */}
      <RelatorioModal
        visible={showRelatorioModal}
        onClose={() => setShowRelatorioModal(false)}
        produtos={produtos}
      />

      <Modal
        isVisible={showModal}
        onBackdropPress={() => setShowModal(false)}
        style={globalStyles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={globalStyles.modalContent}>
          <Text style={globalStyles.modalTitle}>
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </Text>

          <TouchableOpacity style={estoqueStyles.photoButton} onPress={pickImage}>
            {formData.foto ? (
              <Image source={{ uri: formData.foto }} style={estoqueStyles.photoPreview} />
            ) : (
              <View style={estoqueStyles.photoPlaceholder}>
                <Ionicons name="camera" size={30} color={colors.placeholder} />
                <Text style={estoqueStyles.photoText}>Adicionar Foto</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={globalStyles.modalLabel}>Nome do Produto *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Digite o nome do produto"
            value={formData.nome}
            onChangeText={(text) => setFormData({ ...formData, nome: text })}
          />

          <Text style={globalStyles.modalLabel}>Quantidade *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Digite a quantidade"
            value={formData.quantidade}
            onChangeText={(text) => setFormData({ ...formData, quantidade: text })}
            keyboardType="numeric"
          />

          <Text style={globalStyles.modalLabel}>Quantidade Mínima (opcional)</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Digite a quantidade mínima"
            value={formData.quantidadeMinima}
            onChangeText={(text) => setFormData({ ...formData, quantidadeMinima: text })}
            keyboardType="numeric"
          />

          <Text style={globalStyles.modalLabel}>Preço de Custo *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="0,00"
            value={formData.custo}
            onChangeText={(text) => setFormData({ ...formData, custo: text })}
            keyboardType="decimal-pad"
          />

          <Text style={globalStyles.modalLabel}>Preço de Venda *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="0,00"
            value={formData.venda}
            onChangeText={(text) => setFormData({ ...formData, venda: text })}
            keyboardType="decimal-pad"
          />

          <View style={globalStyles.modalButtons}>
            <TouchableOpacity
              style={[globalStyles.modalButton, globalStyles.modalCancelButton]}
              onPress={() => setShowModal(false)}
            >
              <Text style={globalStyles.modalCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.modalButton, globalStyles.modalSaveButton]}
              onPress={handleSave}
            >
              <Text style={globalStyles.modalSaveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EstoqueScreen;