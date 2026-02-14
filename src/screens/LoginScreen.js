import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Image,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { theme } from '../styles/theme';
import { loginUser } from '../services/api';
import { saveData, getData } from '../services/storage';
import { checkForUpdates } from '../services/updateHandler';

const { width } = Dimensions.get('window');

export const LoginScreen = ({ navigation }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const checkSession = async () => {
            // Check if already logged in
            const role = await getData('@user_role');
            if (role) {
                navigation.replace('Home');
            }
        };
        checkSession();
    }, []);

    const handleLogin = async () => {
        if (!password) {
            Alert.alert('Error', 'Please enter a password');
            return;
        }

        setLoading(true);
        try {
            const result = await loginUser(password);
            if (result.success) {
                // Save session info
                await saveData('@user_role', result.role);
                await saveData('@user_name', result.name);
                // Navigate to app
                navigation.replace('Home');
            } else {
                Alert.alert('Login Failed', 'Incorrect password. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <LinearGradient
                    colors={theme.gradients.header}
                    style={styles.background}
                >
                    <View style={styles.decor1} />
                    <View style={styles.decor2} />

                    <View style={styles.content}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/icon.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <Text style={styles.title}>Brij Industry</Text>
                            <Text style={styles.subtitle}>Tracker Management</Text>
                        </View>

                        <View style={styles.formCard}>
                            <Text style={styles.formTitle}>Secure Access</Text>
                            <Text style={styles.formSubtitle}>Enter your access password to continue</Text>

                            <CustomInput
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                icon="🔒"
                                secureTextEntry={true} // Need to ensure CustomInput handles this or use auto-props
                            />

                            <CustomButton
                                title="Login"
                                onPress={handleLogin}
                                loading={loading}
                                icon="🚀"
                                style={styles.loginBtn}
                            />


                            <Text style={styles.footerText}>
                                Restricted access for authorized personnel only
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    background: {
        flex: 1,
        justifyContent: 'center',
    },
    decor1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    decor2: {
        position: 'absolute',
        bottom: -50,
        left: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    content: {
        paddingHorizontal: theme.spacing.xl,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 30,
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    formCard: {
        width: '100%',
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        ...theme.shadows.xl,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xl,
    },
    loginBtn: {
        marginTop: theme.spacing.md,
    },
    footerText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
        fontSize: 12,
        marginTop: theme.spacing.xl,
    },
    updateBadge: {
        marginTop: theme.spacing.lg,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: 10,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    updateBadgeText: {
        color: theme.colors.success,
        fontSize: 13,
        fontWeight: 'bold',
    }
});
