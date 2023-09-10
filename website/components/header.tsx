import { FiUser, FiSettings } from 'react-icons/fi';
import { getServerSession } from 'next-auth';
import { callbacks } from '@/app/api/auth/[...nextauth]/route';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';

const Navbar = async () => {
    const session = await getServerSession(callbacks);

    const categories: { id: number; name: string }[] = [
        { id: 1, name: 'Histórico' },
        { id: 2, name: 'Comprovantes' },
        { id: 3, name: 'Configurações' },
    ];

    return (
        <header className="w-full sticky top-0 bg-white border-gray-300 border-b">
            <div className="w-full h-20 flex items-center justify-between">
                <Link href="/" className="px-6 hidden lg:block">
                    <Image src={process.env.NEXT_PUBLIC_SITE_URL + '/logo.svg'} alt="Logo" width={160} height={40} />
                </Link>
                <div className="flex items-center space-x-4 max-w-[18%] mr-[1%] sm:mr-4 lg:mr-6">
                    <Link
                        href={session?.user.role && session?.user.role !== 'USER' ? '/admin' : '/cart'}
                        className="cursor-pointer relative inline-flex items-center"
                    >
                        {session?.user.role && session?.user.role !== 'USER' ? (
                            <FiSettings className="text-gray-800 text-3xl cursor-pointer hover:text-gray-600" />
                        ) : null}
                    </Link>
                    <Link href={!session?.user ? '/login' : '/account'}>
                        {session?.user.avatar ? (
                            <Image
                                src={session.user.avatar}
                                alt={session.user.name + ' avatar'}
                                width={48}
                                height={48}
                                className="border-black border-2 rounded-full"
                            />
                        ) : (
                            <FiUser className="text-gray-800 border-black border-2 p-2 rounded-full text-5xl cursor-pointer hover:text-gray-600" />
                        )}
                    </Link>
                </div>
            </div>
            <nav className="hidden lg:block w-full">
                <ul className="block lg:flex">
                    <ListItem className="text-dark hover:text-primary border-gray-300 border-r px-8" NavLink="/">
                        Início
                    </ListItem>
                    {categories.map(({ id, name }) => (
                        <ListItem
                            key={'NavBar-' + id}
                            className="text-dark hover:text-primary border-gray-300 border-r px-8"
                            NavLink={`/${name}`}
                        >
                            {name}
                        </ListItem>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;

const ListItem = ({
    children,
    className,
    NavLink,
}: {
    children: React.ReactNode;
    className?: string;
    NavLink: string;
}) => {
    return (
        <>
            <li>
                <Link
                    href={NavLink}
                    className={clsx('flex justify-center items-center py-2 text-base font-medium', className)}
                >
                    {children}
                </Link>
            </li>
        </>
    );
};
