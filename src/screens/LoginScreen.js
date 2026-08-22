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
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { theme } from '../styles/theme';
import { loginUser } from '../services/api';
import { saveData, getData } from '../services/storage';

const { width } = Dimensions.get('window');

export const LoginScreen = ({ navigation }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const checkSession = async () => {
            const role = await getData('@user_role');
            if (role) {
                navigation.replace('Home');
            }
        };
        checkSession();
    }, []);

    const handleLogin = async () => {
        if (!password.trim()) {
            Alert.alert('Password Required', 'Please enter your account password to proceed.');
            return;
        }

        setLoading(true);
        try {
            const result = await loginUser(password.trim());
            if (result.success) {
                await saveData('@user_role', result.role);
                await saveData('@user_name', result.name);
                navigation.replace('Home');
            } else {
                Alert.alert('Login Failed', 'Incorrect password. Please verify and try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Connection Error', 'Could not connect to server. Please check internet connection.');
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
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.background}
                >
                    <View style={styles.decor1} />
                    <View style={styles.decor2} />

                    <View style={styles.content}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoBadge}>
                                <Image
                                    source={require('../../assets/icon.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.title}>Brij Industry</Text>
                            <Text style={styles.subtitle}>Vehicle & Fleet Enterprise Tracker</Text>
                        </View>

                        <View style={styles.formCard}>
                            <View style={styles.formHeader}>
                                <Text style={styles.formTitle}>Enterprise Sign In</Text>
                                <Text style={styles.formSubtitle}>Enter employee password to access system</Text>
                            </View>

                            <CustomInput
                                label="Access Password"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter your password"
                                icon="🔒"
                                secureTextEntry={!showPassword}
                                rightElement={
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeBtn}
                                    >
                                        <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                                    </TouchableOpacity>
                                }
                            />

                            <CustomButton
                                title="Sign In to Operations"
                                onPress={handleLogin}
                                loading={loading}
                                icon="🚀"
                                style={styles.loginBtn}
                            />

                            <View style={styles.securityNoteRow}>
                                <Text style={styles.securityIcon}>🛡️</Text>
                                <Text style={styles.footerText}>
                                    Secure role-based access for drivers & administration
                                </Text>
                            </View>
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
        backgroundColor: '#0b1e38',
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
        top: -80,
        right: -80,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    decor2: {
        position: 'absolute',
        bottom: -60,
        left: -60,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    content: {
        paddingHorizontal: theme.spacing.lg,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logoBadge: {
        width: 100,
        height: 100,
        borderRadius: 28,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
        ...theme.shadows.lg,
    },
    logo: {
        width: 80,
        height: 80,
    },
    title: {
        fontSize: 30,
        fontWeight: theme.fontWeight.extrabold,
        color: '#fff',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
        letterSpacing: 0.2,
    },
    formCard: {
        width: '100%',
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.xl,
    },
    formHeader: {
        marginBottom: theme.spacing.lg,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    eyeBtn: {
        padding: 6,
    },
    eyeText: {
        fontSize: 16,
    },
    loginBtn: {
        marginTop: theme.spacing.sm,
    },
    securityNoteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.lg,
        gap: 6,
    },
    securityIcon: {
        fontSize: 13,
    },
    footerText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
        fontSize: 11,
        fontWeight: theme.fontWeight.medium,
    },
});
