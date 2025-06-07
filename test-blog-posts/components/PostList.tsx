import React, { useState } from 'react';
import { ScrollView, Text, View, Button, TextInput, StyleSheet } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

const fetchPosts = async (userId?: number): Promise<Post[]> => {
    const url = userId 
      ? `https://jsonplaceholder.typicode.com/posts?userId=${userId}` 
      : `https://jsonplaceholder.typicode.com/posts`;
  
    const response = await fetch(url);
    return response.json();
  };

const createPost = async (newPost: { title: string; body: string }): Promise<Post> => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...newPost, userId: 1 }),
  });
  return response.json();
};

const updatePost = async ({ id, title }: { id: number; title: string; }): Promise<Post> => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    return response.json();
  };
  

const deletePost = async (id: number): Promise<void> => {
  await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    method: 'DELETE',
  });
};

export default function PostList() {
    const queryClient = useQueryClient();
    const [userId, setUserId] = useState<number | null>(null);
    const { data, error, isLoading } = useQuery<Post[], Error>({
      queryKey: ['posts', userId],
      queryFn: () => fetchPosts(userId ?? undefined),
    });

  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const createMutation = useMutation<Post, Error, { title: string; body: string }>({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      queryClient.setQueryData(['posts'], (oldData?: Post[]) => {
        return oldData ? [...oldData, newPost] : [newPost]; 
      });
      setTitle('');
      setBody('');
    },
  });

  const updateMutation = useMutation<Post, Error, { id: number; title: string }>({
    mutationFn: updatePost,
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(['posts', userId], (oldData?: Post[]) =>
        oldData?.map(post => post.id === updatedPost.id ? updatedPost : post) ?? []
      );
    },
  });
  
  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: deletePost,
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['posts', userId], (oldData?: Post[]) =>
        oldData ? oldData.filter(post => post.id !== variables) : []
      );
    },
  });
  
  
  const handleEdit = (post: Post) => {
    setEditingPost(post.id);
    setTitle(post.title);
    setBody(post.body);
  };

  const handleUpdate = () => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost, title });
      setEditingPost(null);
      setTitle('');
    }
  };
  

  if (isLoading) return <Text style={styles.loading}>Loading...</Text>;
  if (error) return <Text style={styles.error}>Error fetching posts</Text>;

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input} 
        value={userId ? userId.toString() : ''}
        onChangeText={(text) => setUserId(text ? parseInt(text, 10) : null)}
        placeholder="Filter by User ID" 
        keyboardType="numeric"
      />
      <Button title="Apply Filter" onPress={() => queryClient.invalidateQueries({ queryKey: ['posts', userId] })} />

      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Post Title" />
      <TextInput style={styles.input} value={body} onChangeText={setBody} placeholder="Post Body" />
      <Button title="Create Post" onPress={() => createMutation.mutate({ title, body })} color="green" />

      <ScrollView>
      {data?.map((item) => (
        <View key={item.id} style={styles.card}>
          {editingPost === item.id ? (
            <>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Edit Title"
              />
              <Button title="Save" onPress={handleUpdate} />
            </>
          ) : (
            <>
              <Text style={styles.userId}>User ID: {item.userId}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <View style={styles.buttonContainer}>
                <Button title="Update" onPress={() => handleEdit(item)} color="orange" />
                <Button title="Delete" onPress={() => deleteMutation.mutate(item.id)} color="red" />
              </View>
            </>
          )}
        </View>
      ))}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  loading: { textAlign: 'center', fontSize: 18, color: 'blue' },
  error: { textAlign: 'center', fontSize: 18, color: 'red' },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  body: { fontSize: 14, color: '#666' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  userId: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: 'blue', 
    marginBottom: 5 
    },
});
