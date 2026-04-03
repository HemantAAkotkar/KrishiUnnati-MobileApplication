const SubCategoryCard = ({ item }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.subCategoryCard}
      // Navigate to Marketplace and pass the category as a filter
      onPress={() => router.push({ 
        pathname: '/marketplace', 
        params: { filterCategory: item.category } 
      })}
    >
      <View style={styles.subCategoryCardImagePlaceholder}>
        <Feather name="layers" size={30} color="#2D6A4F" />
      </View>
      <Text style={styles.subCategoryCardText}>{item.name}</Text>
    </TouchableOpacity>
  );
};