"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@/types"

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем пользователя из localStorage при инициализации
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && typeof parsedUser === 'object' && 'name' in parsedUser && 'email' in parsedUser) {
          setUserState(parsedUser);
        } else {
          console.warn("Invalid user data in localStorage, removing");
          localStorage.removeItem("user");
        }
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Слушаем изменения в localStorage для синхронизации между вкладками
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "user") {
        if (event.newValue) {
          try {
            const parsedUser = JSON.parse(event.newValue);
            setUserState(parsedUser);
          } catch (e) {
            console.error("Error parsing user from storage event:", e);
          }
        } else {
          setUserState(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Функция для установки пользователя
  const setUser = async (newUser: User | null) => {
    try {
      if (newUser) {
        // Сохраняем в localStorage для быстрого доступа
        localStorage.setItem("user", JSON.stringify(newUser));

        // Upsert в Supabase (создает или обновляет)
        const { data, error } = await supabase
          .from('users')
          .upsert(
            {
              name: newUser.name,
              email: newUser.email
            },
            {
              onConflict: 'email',
              ignoreDuplicates: false
            }
          )
          .select()
          .single();

        if (error) {
          console.error("Error saving to Supabase:", error);
          // В случае ошибки оставляем локальные данные
          setUserState(newUser);
        } else {
          // Обновляем с данными из Supabase (включая id и created_at)
          const updatedUser = {
            id: data.id,
            name: data.name,
            email: data.email,
            created_at: data.created_at
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUserState(updatedUser);
        }
      } else {
        // Если null, удаляем пользователя
        localStorage.removeItem("user");

        // Удаляем из Supabase если есть email
        if (user?.email) {
          const { error } = await supabase
            .from('users')
            .delete()
            .eq('email', user.email);

          if (error) {
            console.warn("Failed to delete user from Supabase:", error);
          }
        }

        setUserState(null);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      // В случае критической ошибки сохраняем только локально
      setUserState(newUser);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}