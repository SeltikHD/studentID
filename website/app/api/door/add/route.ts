// Endpoint que adiciona uma porta ao banco de dados (precisa de autenticação de um usuário ADM)
import type { User } from 'next-auth';
import { NextResponse } from 'next/server';
import { getUserData } from '@/services/suap/user';
import { suapLogin } from '@/services/suap/login';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    const { username, password, name, description, session } = await req.json();

    let user: Partial<User> | undefined = undefined;

    if (typeof session !== 'string') {
        if (!/^\d+$/.test(username)) {
            return NextResponse.json({ status: 'error', message: 'Matrícula inválida' }, { status: 400 });
        } else if (
            typeof username !== 'string' ||
            typeof password !== 'string' ||
            typeof name !== 'string' ||
            typeof description !== 'string' ||
            username.length <= 0 ||
            password.length <= 0 ||
            name.length <= 0 ||
            description.length <= 0
        ) {
            return NextResponse.json({ status: 'error', message: 'Campos em falta' }, { status: 400 });
        }

        const suapUser = await suapLogin(username, password);

        if (!suapUser.sessionid) {
            return NextResponse.json({ status: 'error', message: 'Credenciais inválidas' }, { status: 400 });
        }

        user =
            (await prisma.user.findUnique({
                where: { id: username },
            })) ?? undefined;
    } else {
        const userSuap = await getUserData({
            value: session,
            expires: Math.floor((Date.now() + 8 * 60 * 60 * 1000) / 1000),
        });

        user =
            (await prisma.user.findUnique({
                where: { suapId: userSuap?.registration },
            })) ?? undefined;
    }

    if (!user?.role) {
        return NextResponse.json({ status: 'error', message: 'Usuário não encontrado' }, { status: 400 });
    } else if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        return NextResponse.json(
            { status: 'error', message: 'Você não tem permissão para fazer isso' },
            { status: 400 },
        );
    }

    const door = await prisma.door
        .create({
            data: {
                name,
                description,
            },
        })
        .catch(() => undefined);

    if (!door) {
        return NextResponse.json({ status: 'error', message: 'Erro ao criar porta' }, { status: 400 });
    }

    return NextResponse.json({
        status: 'success',
        message: `Porta criada com sucesso! ID: ${door.id}`,
    });
}
